from rest_framework import viewsets
from .models import Cliente, Projeto, Tarefa, Subtarefa, Pasta, Arquivo
from .serializers import ClienteSerializer, ProjetoSerializer, TarefaSerializer, SubtarefaSerializer, PastaSerializer, ArquivoSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class ProjetoViewSet(viewsets.ModelViewSet):
    queryset = Projeto.objects.all()
    serializer_class = ProjetoSerializer

class TarefaViewSet(viewsets.ModelViewSet):
    queryset = Tarefa.objects.all()
    serializer_class = TarefaSerializer

class SubtarefaViewSet(viewsets.ModelViewSet):
    queryset = Subtarefa.objects.all()
    serializer_class = SubtarefaSerializer

class PastaViewSet(viewsets.ModelViewSet):
    queryset = Pasta.objects.all()
    serializer_class = PastaSerializer

class ArquivoViewSet(viewsets.ModelViewSet):
    queryset = Arquivo.objects.all()
    serializer_class = ArquivoSerializer
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        arquivo_obj = self.request.FILES.get('arquivo')
        tamanho = arquivo_obj.size if arquivo_obj else 0
        serializer.save(tamanho_bytes=tamanho)

    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        """Retorna toda a cadeia de versões anteriores (arquivadas) de um arquivo."""
        arquivo_atual = self.get_object()
        versoes_anteriores = []
        
        atual = arquivo_atual.versao_de
        while atual:
            versoes_anteriores.append(ArquivoSerializer(atual).data)
            atual = atual.versao_de
            
        return Response(versoes_anteriores)