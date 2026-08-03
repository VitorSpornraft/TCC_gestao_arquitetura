from rest_framework import serializers
from .models import Cliente, Projeto, Tarefa, Subtarefa, Pasta, Arquivo

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class ProjetoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projeto
        fields = '__all__'

class SubtarefaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtarefa
        fields = '__all__'

class TarefaSerializer(serializers.ModelSerializer):
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