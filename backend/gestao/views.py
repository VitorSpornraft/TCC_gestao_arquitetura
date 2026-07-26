from django.shortcuts import render
from rest_framework import viewsets
from .models import Cliente, Tarefa, Subtarefa, Pasta, Arquivo, VersaoArquivo 
from .serializers import ClienteSerializer, TarefaSerializer, SubtarefaSerializer, PastaSerializer, ArquivoSerializer, VersaoArquivoSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

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

class VersaoArquivoViewSet(viewsets.ModelViewSet):
    queryset = VersaoArquivo.objects.all()
    serializer_class = VersaoArquivoSerializer
