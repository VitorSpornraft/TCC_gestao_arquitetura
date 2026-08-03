from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

# TABELA DE CLIENTES (Pessoa Física ou Jurídica)
class Cliente(models.Model):
    nome = models.CharField(max_length=200)
    foto = models.URLField(blank=True, null=True)
    
    # Contato (Sem E-mail, conforme combinamos!)
    ddi = models.CharField(max_length=5, default="+55")
    ddd = models.CharField(max_length=5, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

# TABELA DE PROJETOS
class Projeto(models.Model):
    # Relacionamento 1 para N (Um cliente pode ter vários projetos)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='projetos')
    
    nome_projeto = models.CharField(max_length=200)
    tipo_projeto = models.CharField(max_length=100, blank=True, null=True) 
    fase_atual = models.CharField(max_length=100, blank=True, null=True)   
    
    # Endereço da Obra
    cep = models.CharField(max_length=20, blank=True, null=True)
    rua = models.CharField(max_length=200, blank=True, null=True)
    numero = models.CharField(max_length=20, blank=True, null=True)
    bairro = models.CharField(max_length=100, blank=True, null=True)
    cidade = models.CharField(max_length=100, blank=True, null=True)
    uf = models.CharField(max_length=2, blank=True, null=True)
    
    arquivado = models.BooleanField(default=False) 
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome_projeto} ({self.cliente.nome})"

# TABELA DE TAREFAS
class Tarefa(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    prazo = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, default='REALIZAR')
    progresso = models.IntegerField(default=0)
    
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='tarefas')
    
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

# TABELA DE SUBTAREFAS
class Subtarefa(models.Model):
    tarefa = models.ForeignKey(Tarefa, on_delete=models.CASCADE, related_name='subtarefas')
    titulo = models.CharField(max_length=200)
    concluida = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

# TABELAS DO EXPLORADOR DE ARQUIVOS
class Pasta(models.Model):
    nome = models.CharField(max_length=255)
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='pastas')
    pasta_pai = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subpastas')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} - {self.projeto.nome_projeto}"

class Arquivo(models.Model):
    nome = models.CharField(max_length=255)
    arquivo = models.FileField(upload_to='projetos_arquivos/')
    pasta = models.ForeignKey(Pasta, on_delete=models.CASCADE, related_name='arquivos')
    tamanho_bytes = models.BigIntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.nome

# AUTOMAÇÃO: CRIA AS PASTAS ASSIM QUE O PROJETO É SALVO
@receiver(post_save, sender=Projeto)
def criar_pastas_padrao(sender, instance, created, **kwargs):
    if created:
        pastas = [
            '01 - Documentação e Briefing',
            '02 - Projetos e Plantas',
            '03 - Imagens e Renders',
            '04 - Orçamentos'
        ]
        for p in pastas:
            Pasta.objects.create(nome=p, projeto=instance)