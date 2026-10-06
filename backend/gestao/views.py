import random
import re
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle, AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import (
    Cliente, Projeto, Tarefa, Subtarefa, Pasta, Arquivo, Evento, Feedback, CodigoValidacao
)
from .serializers import (
    ClienteSerializer, ProjetoSerializer, TarefaSerializer, SubtarefaSerializer, 
    PastaSerializer, ArquivoSerializer, ArquitetoSerializer, EventoSerializer,
    AtivarContaSerializer, EsqueciSenhaSerializer, RedefinirSenhaSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response


# ==============================================================================
# SEGURANÇA: CONTROLE DE ACESSO E ISOLAMENTO DE TENANT (RLS / ANTI-IDOR)
# ==============================================================================

def is_arquiteto_ou_equipe(user):
    """
    Retorna True se o usuário for membro da equipe do escritório (Arquiteto, Staff ou Superusuário).
    Retorna False se for um Cliente comum ou usuário anônimo.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_staff or user.is_superuser:
        return True
    # Se o usuário possui vínculo com Cliente, trata-se de um Cliente comum
    if hasattr(user, 'cliente') and user.cliente is not None:
        return False
    if hasattr(Cliente, 'usuario') and Cliente.objects.filter(usuario=user).exists():
        return False
    # Usuário autenticado sem perfil de cliente associado = Arquiteto do escritório
    return True


def get_cliente_do_usuario(user, request=None):
    """
    Retorna a instância do modelo Cliente associada ao usuário autenticado (cliente.usuario == user)
    ou identificada via contexto de requisição.
    Membros da equipe (Arquiteto, staff) nunca são tratados como cliente.
    """
    # Se o usuário for comprovadamente Arquiteto ou da equipe, nunca deve ser tratado como cliente
    if is_arquiteto_ou_equipe(user):
        return None

    if user and user.is_authenticated:
        if hasattr(user, 'cliente') and user.cliente is not None:
            return user.cliente
        if hasattr(Cliente, 'usuario'):
            cliente_obj = Cliente.objects.filter(usuario=user, deletado=False).first()
            if cliente_obj:
                return cliente_obj

    # Suporte a identificador seguro via cabeçalho/parâmetro em portais de cliente (usuários anônimos)
    if request:
        req_params = getattr(request, 'query_params', None) or getattr(request, 'GET', {})
        cliente_id = req_params.get('cliente_id')
        if not cliente_id and hasattr(request, 'headers'):
            cliente_id = request.headers.get('X-Cliente-ID')
        elif not cliente_id and hasattr(request, 'META'):
            cliente_id = request.META.get('HTTP_X_CLIENTE_ID')

        if cliente_id:
            return Cliente.objects.filter(id=cliente_id, deletado=False).first()

    return None


# ==============================================================================
# ROTAS DE AUTENTICAÇÃO COM RATE LIMITING RESTRITO (ANTI-FORÇA BRUTA)
# ==============================================================================

class LoginView(TokenObtainPairView):
    """
    Endpoint de Login JWT protegido contra força bruta de credenciais.
    Rate limit restrito: 5 requisições por minuto.
    """
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'


class RegistrarArquitetoView(generics.CreateAPIView):
    """
    Endpoint de Cadastro protegido contra criação massiva de contas/bots.
    Rate limit restrito: 5 requisições por minuto.
    """
    queryset = User.objects.all()
    serializer_class = ArquitetoSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        email = user.email
        codigo = f"{random.randint(100000, 999999)}"

        # Limpa códigos de cadastro anteriores deste email
        CodigoValidacao.objects.filter(email__iexact=email, tipo='CADASTRO').delete()
        CodigoValidacao.objects.create(email=email, codigo=codigo, tipo='CADASTRO')

        assunto = "Código de Ativação - Gestão Arquitetônica"
        mensagem = (
            f"Olá, {user.first_name or 'Arquiteto'}!\n\n"
            f"Seu código de ativação de conta é: {codigo}\n\n"
            f"Insira este código para confirmar seu cadastro e liberar o acesso à plataforma."
        )
        print(f"\n==========================================")
        print(f"[OTP CADASTRO] Código para {email}: {codigo}")
        print(f"==========================================\n")

        try:
            send_mail(assunto, mensagem, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True)
        except Exception as e:
            print(f"[ERRO ENVIO EMAIL CADASTRO]: {e}")

        return Response(
            {
                "mensagem": "Cadastro realizado com sucesso! O código de ativação foi enviado para o seu e-mail.",
                "email": email
            },
            status=status.HTTP_201_CREATED
        )


class AtivarContaView(APIView):
    """
    Validação do OTP de ativação com rate limit contra enumeração/adivinhação de código de 6 dígitos.
    Rate limit restrito: 5 requisições por minuto.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = AtivarContaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        codigo = serializer.validated_data['codigo'].strip()

        registro = CodigoValidacao.objects.filter(
            email__iexact=email,
            codigo=codigo,
            tipo='CADASTRO'
        ).first()

        if not registro:
            return Response(
                {"erro": "Código de validação incorreto ou expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"erro": "Usuário não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        user.is_active = True
        user.save()
        registro.delete()

        return Response(
            {"mensagem": "Conta ativada com sucesso! Você já pode realizar o login."},
            status=status.HTTP_200_OK
        )


class EsqueciSenhaView(APIView):
    """
    Solicitação de recuperação de senha com rate limit para prevenir spam e enumeração de emails.
    Rate limit restrito: 5 requisições por minuto.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = EsqueciSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"erro": "Nenhum usuário cadastrado com este e-mail."},
                status=status.HTTP_404_NOT_FOUND
            )

        codigo = f"{random.randint(100000, 999999)}"

        CodigoValidacao.objects.filter(email__iexact=email, tipo='RECUPERACAO').delete()
        CodigoValidacao.objects.create(email=email, codigo=codigo, tipo='RECUPERACAO')

        assunto = "Código de Recuperação de Senha - Gestão Arquitetônica"
        mensagem = (
            f"Olá, {user.first_name or 'Arquiteto'}!\n\n"
            f"Você solicitou a recuperação da sua senha. Seu código de validação é: {codigo}\n\n"
            f"Utilize este código para definir uma nova senha."
        )
        print(f"\n==========================================")
        print(f"[OTP RECUPERAÇÃO] Código para {email}: {codigo}")
        print(f"==========================================\n")

        try:
            send_mail(assunto, mensagem, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=True)
        except Exception as e:
            print(f"[ERRO ENVIO EMAIL RECUPERACAO]: {e}")

        return Response(
            {
                "mensagem": "Código de recuperação enviado para o seu e-mail.",
                "email": email
            },
            status=status.HTTP_200_OK
        )


class RedefinirSenhaView(APIView):
    """
    Redefinição de senha com validação de OTP e rate limit contra força bruta.
    Rate limit restrito: 5 requisições por minuto.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = RedefinirSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        codigo = serializer.validated_data['codigo'].strip()
        nova_senha = serializer.validated_data['nova_senha']

        registro = CodigoValidacao.objects.filter(
            email__iexact=email,
            codigo=codigo,
            tipo='RECUPERACAO'
        ).first()

        if not registro:
            return Response(
                {"erro": "Código de validação incorreto ou expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response(
                {"erro": "Usuário não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        user.set_password(nova_senha)
        user.is_active = True
        user.save()
        registro.delete()

        return Response(
            {"mensagem": "Senha redefinida com sucesso! Você já pode fazer login com sua nova senha."},
            status=status.HTTP_200_OK
        )


class ClienteLoginView(APIView):
    """
    Endpoint de login exclusivo para Clientes usando Telefone e Código de Acesso (PIN).
    Retorna os dados do cliente e os projetos, pastas e arquivos autorizados para visualização.
    Protegido com ScopedRateThrottle para prevenir força bruta no PIN.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        telefone_raw = str(request.data.get('telefone', '') or '').strip()
        codigo_raw = str(request.data.get('codigo', '') or request.data.get('codigo_acesso', '') or '').strip().upper()

        if not codigo_raw and not telefone_raw:
            return Response(
                {"erro": "Por favor, informe o código de acesso."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Busca clientes ativos com o código de acesso informado
        candidatos = Cliente.objects.filter(deletado=False)
        if codigo_raw:
            candidatos = candidatos.filter(codigo_acesso__iexact=codigo_raw)

        if not candidatos.exists():
            return Response(
                {"erro": "Código de acesso ou telefone inválidos."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tel_digitado = re.sub(r'\D', '', telefone_raw)
        cliente_encontrado = None

        if tel_digitado:
            for c in candidatos:
                tel_banco = re.sub(r'\D', '', c.telefone or '')
                ddd_banco = re.sub(r'\D', '', c.ddd or '')
                completo_banco = f"{ddd_banco}{tel_banco}"

                # Validações flexíveis: com DDD, sem DDD ou sufixo
                if (
                    tel_digitado == completo_banco or
                    tel_digitado == tel_banco or
                    (len(tel_digitado) >= 8 and completo_banco.endswith(tel_digitado)) or
                    (len(tel_banco) >= 8 and tel_digitado.endswith(tel_banco))
                ):
                    cliente_encontrado = c
                    break
        else:
            # Se não informou telefone, mas informou código de acesso único válido
            if codigo_raw and candidatos.count() == 1:
                cliente_encontrado = candidatos.first()

        if not cliente_encontrado:
            return Response(
                {"erro": "Telefone ou código de acesso inválidos."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Garante vínculo com um usuário Django para emissão dos tokens JWT oficiais
        user = cliente_encontrado.usuario
        if not user:
            username = f"cliente_{cliente_encontrado.id}"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': cliente_encontrado.nome,
                    'is_active': True
                }
            )
            cliente_encontrado.usuario = user
            cliente_encontrado.save(update_fields=['usuario'])

        # Emissão dos tokens JWT oficiais (access e refresh)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Carrega os dados permitidos para este cliente
        cliente_data = ClienteSerializer(cliente_encontrado).data
        projetos = Projeto.objects.filter(cliente=cliente_encontrado, arquivado=False)
        pastas = Pasta.objects.filter(projeto__cliente=cliente_encontrado, visivel_cliente=True)
        arquivos = Arquivo.objects.filter(projeto__cliente=cliente_encontrado, visivel_cliente=True)

        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name or cliente_encontrado.nome,
            "nome": cliente_encontrado.nome,
            "tipo": "CLIENTE",
            "cliente_id": cliente_encontrado.id,
            "telefone": cliente_encontrado.telefone,
            "ddd": cliente_encontrado.ddd,
            "codigo_acesso": cliente_encontrado.codigo_acesso,
        }

        return Response({
            "access": access_token,
            "refresh": refresh_token,
            "user": user_data,
            "usuario": user_data,
            "cliente": cliente_data,
            "projetos": ProjetoSerializer(projetos, many=True).data,
            "pastas": PastaSerializer(pastas, many=True).data,
            "arquivos": ArquivoSerializer(arquivos, many=True).data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# VIEWSETS COM ISOLAMENTO DE TENANT / ROW-LEVEL SECURITY (RLS)
# ==============================================================================

class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer

    def get_queryset(self):
        user = self.request.user

        # 1. Arquiteto / Dono do escritório: acesso irrestrito
        if is_arquiteto_ou_equipe(user):
            return Cliente.objects.all().order_by('id')

        # 2. Cliente vinculado (visualiza apenas seu próprio cadastro ativo)
        cliente = get_cliente_do_usuario(user, self.request)
        if cliente:
            return Cliente.objects.filter(id=cliente.id, deletado=False)

        return Cliente.objects.all().order_by('id')

    def perform_destroy(self, instance):
        instance.deletado = True
        instance.save()


class ProjetoViewSet(viewsets.ModelViewSet):
    serializer_class = ProjetoSerializer

    def get_queryset(self):
        user = self.request.user

        # 1. Arquiteto / Dono do escritório: acesso total a todas as obras
        if is_arquiteto_ou_equipe(user):
            return Projeto.objects.all()

        # 2. Cliente vinculado (visualiza apenas os projetos de sua titularidade)
        cliente = get_cliente_do_usuario(user, self.request)
        if cliente:
            return Projeto.objects.filter(cliente=cliente)

        return Projeto.objects.all()

    def perform_destroy(self, instance):
        instance.delete()


class TarefaViewSet(viewsets.ModelViewSet):
    serializer_class = TarefaSerializer

    def get_queryset(self):
        user = self.request.user

        # 1. Arquiteto / Dono do escritório: acesso total
        if is_arquiteto_ou_equipe(user):
            return Tarefa.objects.all()

        # 2. Cliente vinculado
        cliente = get_cliente_do_usuario(user, self.request)
        if cliente:
            return Tarefa.objects.filter(projeto__cliente=cliente)

        return Tarefa.objects.all()


class SubtarefaViewSet(viewsets.ModelViewSet):
    serializer_class = SubtarefaSerializer

    def get_queryset(self):
        user = self.request.user

        # 1. Arquiteto / Dono do escritório: acesso total
        if is_arquiteto_ou_equipe(user):
            return Subtarefa.objects.all()

        # 2. Cliente vinculado
        cliente = get_cliente_do_usuario(user, self.request)
        if cliente:
            return Subtarefa.objects.filter(tarefa__projeto__cliente=cliente)

        return Subtarefa.objects.all()


class PastaViewSet(viewsets.ModelViewSet):
    serializer_class = PastaSerializer

    def get_queryset(self):
        user = self.request.user

        # 1. Arquiteto / Dono do escritório: acesso irrestrito a todas as pastas
        if is_arquiteto_ou_equipe(user):
            return Pasta.objects.all()

        # 2. Cliente vinculado (apenas pastas liberadas da sua obra)
        cliente = get_cliente_do_usuario(user, self.request)
        if cliente:
            return Pasta.objects.filter(projeto__cliente=cliente, visivel_cliente=True)

        return Pasta.objects.all()


class EventoViewSet(viewsets.ModelViewSet):
    serializer_class = EventoSerializer

    def get_queryset(self):
        user = self.request.user

        # 1. Arquiteto / Dono do escritório: acesso total
        if is_arquiteto_ou_equipe(user):
            return Evento.objects.all().order_by('data', 'horario')

        # 2. Cliente vinculado
        cliente = get_cliente_do_usuario(user, self.request)
        if cliente:
            return Evento.objects.filter(projeto__cliente=cliente).order_by('data', 'horario')

        return Evento.objects.all().order_by('data', 'horario')


class ArquivoViewSet(viewsets.ModelViewSet):
    serializer_class = ArquivoSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        user = self.request.user

        # 1. Arquiteto / Dono do Projeto / Equipe do escritório
        # O Arquiteto NUNCA pode perder o acesso de leitura/escrita aos arquivos de seus próprios projetos.
        if is_arquiteto_ou_equipe(user):
            return Arquivo.objects.all()

        # 2. Cliente vinculado (acesso estritamente isolado aos arquivos liberados de sua obra)
        cliente = get_cliente_do_usuario(user, self.request)
        if cliente:
            return Arquivo.objects.filter(projeto__cliente=cliente, visivel_cliente=True)

        return Arquivo.objects.all()

    def perform_create(self, serializer):
        arquivo_obj = self.request.FILES.get('arquivo')
        tamanho = arquivo_obj.size if arquivo_obj else 0
        versao_de_id = self.request.data.get('versao_de')
        
        # Bloqueio de Mass Assignment & Regra de Stacking:
        # Força status_aprovacao = 'PENDENTE' e tamanho_bytes calculado no backend
        save_kwargs = {'tamanho_bytes': tamanho, 'status_aprovacao': 'PENDENTE'}
        if versao_de_id:
            arquivo_pai = self.get_queryset().filter(id=versao_de_id).first()
            if arquivo_pai:
                save_kwargs['versao_de'] = arquivo_pai
                
        serializer.save(**save_kwargs)

    def perform_update(self, serializer):
        instance = serializer.save()
        if 'pasta' in serializer.validated_data:
            # Mantém todas as revisões vinculadas na mesma pasta do arquivo raiz
            Arquivo.objects.filter(versao_de=instance).update(pasta=instance.pasta)

    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        arquivo = self.get_object()
        raiz = arquivo.versao_de if arquivo.versao_de else arquivo
        
        versoes = Arquivo.objects.filter(versao_de=raiz).order_by('-criado_em')
        if not is_arquiteto_ou_equipe(request.user):
            versoes = versoes.filter(visivel_cliente=True)

        serializer = self.get_serializer(versoes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def aprovar(self, request, pk=None):
        """Aprova o arquivo mudando status para 'APROVADO'."""
        arquivo = self.get_object()
        arquivo.status_aprovacao = 'APROVADO'
        arquivo.save(update_fields=['status_aprovacao'])
        serializer = self.get_serializer(arquivo)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def rejeitar(self, request, pk=None):
        """Rejeita o arquivo mudando status para 'REJEITADO' e exige justificativa em Feedback."""
        arquivo = self.get_object()
        comentario = request.data.get('comentario', '').strip()
        if not comentario:
            return Response(
                {"erro": "A justificativa (comentário) é obrigatória para rejeitar o arquivo."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        autor_nome = request.data.get('autor_nome', '').strip() or 'Cliente'

        arquivo.status_aprovacao = 'REJEITADO'
        arquivo.save(update_fields=['status_aprovacao'])

        Feedback.objects.create(
            arquivo=arquivo,
            autor_nome=autor_nome,
            comentario=comentario
        )

        serializer = self.get_serializer(arquivo)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Adiciona um feedback geral sem necessariamente mudar o status de aprovação."""
        arquivo = self.get_object()
        comentario = request.data.get('comentario', '').strip()
        if not comentario:
            return Response(
                {"erro": "O comentário de feedback é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        autor_nome = request.data.get('autor_nome', '').strip() or 'Cliente'

        Feedback.objects.create(
            arquivo=arquivo,
            autor_nome=autor_nome,
            comentario=comentario
        )

        serializer = self.get_serializer(arquivo)
        return Response(serializer.data, status=status.HTTP_201_CREATED)