from rest_framework import serializers
from .models import Cliente, Tarefa, Subtarefa, Pasta, Arquivo, VersaoArquivo

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class SubtarefaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtarefa
        fields = '__all__'
        
class TarefaSerializer(serializers.ModelSerializer):

    progresso = serializers.ReadOnlyField() 
    subtarefas = SubtarefaSerializer(many=True, read_only=True)

    class Meta:
        model = Tarefa
        fields = '__all__'

class PastaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pasta
        fields = '__all__'

class ArquivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arquivo
        fields = '__all__'

class VersaoArquivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VersaoArquivo
        fields = '__all__'