from rest_framework import serializers
from .models import Cliente, Projeto, Tarefa, Subtarefa, Pasta, Arquivo, Evento, Feedback
from django.contrib.auth.models import User


# ==============================================================================
# SERIALIZERS PROTEGIDOS CONTRA MASS ASSIGNMENT (READ_ONLY_FIELDS)
# ==============================================================================

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ['id', 'criado_em']


class ProjetoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projeto
        fields = '__all__'
        read_only_fields = ['id', 'criado_em']


class SubtarefaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtarefa
        fields = '__all__'
        read_only_fields = ['id', 'criado_em']


class TarefaSerializer(serializers.ModelSerializer):
    subtarefas = SubtarefaSerializer(many=True, read_only=True)

    class Meta:
        model = Tarefa
        fields = '__all__'
        read_only_fields = ['id', 'criado_em']


class PastaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pasta
        fields = '__all__'
        read_only_fields = ['id', 'criado_em']


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['id', 'criado_em']


class ArquivoSerializer(serializers.ModelSerializer):
    feedbacks = FeedbackSerializer(many=True, read_only=True)

    class Meta:
        model = Arquivo
        fields = '__all__'
        # Bloqueio estrito de Mass Assignment:
        # - status_aprovacao só pode mudar pelas actions controladas (/aprovar/ e /rejeitar/)
        # - tamanho_bytes é computado pelo backend no upload
        # - versao_de e criado_em são geridos pelo servidor
        read_only_fields = ['id', 'status_aprovacao', 'tamanho_bytes', 'versao_de', 'criado_em']

    def validate_arquivo(self, value):
        from .models import validar_arquivo_seguro
        validar_arquivo_seguro(value)
        return value


class EventoSerializer(serializers.ModelSerializer):
    concluido = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = Evento
        fields = '__all__'
        read_only_fields = ['id', 'criado_em']


class ArquitetoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'password']
        read_only_fields = ['id']
        extra_kwargs = {
            # Garante que o hash da senha NUNCA seja serializado em respostas GET
            'password': {'write_only': True},
            'username': {'required': False}  # Não exigimos no frontend, preenchido com email
        }

    def validate_email(self, value):
        # Permite recadastrar caso a conta anterior não tenha sido ativada (is_active=False)
        if User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado no sistema.")
        return value

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        # Monta objeto User temporário com email/nome para validação de similaridade
        email = self.initial_data.get('email', '')
        first_name = self.initial_data.get('first_name', '')
        user = User(username=email, email=email, first_name=first_name)

        try:
            validate_password(value, user=user)
        except DjangoValidationError as e:
            # Retorna lista com as mensagens amigáveis dos validadores configurados
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        email_fornecido = validated_data.get('email')
        # Reutiliza conta inativa se já existir tentativa prévia pendente de ativação
        user_inativo = User.objects.filter(email=email_fornecido, is_active=False).first()
        if user_inativo:
            user_inativo.set_password(validated_data['password'])
            user_inativo.first_name = validated_data.get('first_name', '')
            user_inativo.save()
            return user_inativo

        user = User.objects.create_user(
            username=email_fornecido, 
            email=email_fornecido,
            first_name=validated_data.get('first_name', ''),
            password=validated_data['password'],
            is_active=False  # REGRA: Nasce inativo até a validação do código OTP
        )
        return user


# ==============================================================================
# SERIALIZERS DE FLUXO DE AUTENTICAÇÃO E RECUPERAÇÃO DE CONTA
# ==============================================================================

class AtivarContaSerializer(serializers.Serializer):
    email = serializers.EmailField()
    codigo = serializers.CharField(max_length=6)


class EsqueciSenhaSerializer(serializers.Serializer):
    email = serializers.EmailField()


class RedefinirSenhaSerializer(serializers.Serializer):
    email = serializers.EmailField()
    codigo = serializers.CharField(max_length=6)
    nova_senha = serializers.CharField(write_only=True)

    def validate_nova_senha(self, value):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        email = self.initial_data.get('email', '')
        user = User.objects.filter(email__iexact=email).first() if email else None

        try:
            validate_password(value, user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
