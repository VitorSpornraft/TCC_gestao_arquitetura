from django.db import models

class Cliente(models.Model):
    nome = models.CharField(max_length=150)
    # null=True, blank=True permite que a foto seja opcional para não travar o cadastro
    foto = models.ImageField(upload_to='clientes_fotos/', null=True, blank=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    ddi = models.CharField(max_length=5, default="+55")
    ddd = models.CharField(max_length=5, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)

    nome_projeto = models.CharField(max_length=200, blank=True, null=True) # Ex: Clínica Pediátrica
    tipo_projeto = models.CharField(max_length=100, blank=True, null=True) # Ex: Interiores, Arquitetônico
    fase_atual = models.CharField(max_length=100, blank=True, null=True)   # Ex: Estudo Preliminar, Obra

    cep = models.CharField(max_length=20, blank=True, null=True)
    rua = models.CharField(max_length=200, blank=True, null=True)
    numero = models.CharField(max_length=20, blank=True, null=True)
    bairro = models.CharField(max_length=100, blank=True, null=True)
    cidade = models.CharField(max_length=100, blank=True, null=True)
    uf = models.CharField(max_length=2, blank=True, null=True)

    arquivado = models.BooleanField(default=False)

    def __str__(self):
        return self.nome


class Tarefa(models.Model):
    STATUS_CHOICES = [
        ('REALIZAR', 'Realizar'),
        ('REALIZANDO', 'Realizando'),
        ('REALIZADO', 'Feito'),
    ]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='tarefas')
    titulo = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REALIZAR')
    prazo = models.DateField()
    categoria = models.CharField(max_length=50) # Ex: 3D, Planta Baixa, Prefeitura

    @property
    def progresso(self):
        total = self.subtarefas.count()
        if total == 0:
            return 0 # Se não tem checklist, é 0%
        concluidas = self.subtarefas.filter(concluida=True).count()
        return int((concluidas / total) * 100)

    def __str__(self):
        return self.titulo

class Subtarefa(models.Model):
    tarefa = models.ForeignKey(Tarefa, related_name='subtarefas', on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    concluida = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.titulo} - {self.tarefa.titulo}"


class Pasta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='pastas')
    nome = models.CharField(max_length=100) # Ex: Projeto Executivo, Estudo Preliminar
    visivel_cliente = models.BooleanField(default=False) # A PRIMEIRA FECHADURA

    def __str__(self):
        return f"{self.nome} ({self.cliente.nome})"


class Arquivo(models.Model):
    pasta = models.ForeignKey(Pasta, on_delete=models.CASCADE, related_name='arquivos')
    nome = models.CharField(max_length=150) # Ex: Maquete 3D Principal
    visivel_cliente = models.BooleanField(default=False) # A SEGUNDA FECHADURA

    def __str__(self):
        return self.nome


class VersaoArquivo(models.Model):
    arquivo = models.ForeignKey(Arquivo, on_delete=models.CASCADE, related_name='versoes')
    numero_versao = models.IntegerField() # v1, v2, v3...
    arquivo_fisico = models.FileField(upload_to='arquivos_projetos/') # O .glb ou PDF real
    mensagem_commit = models.CharField(max_length=255) # Ex: "Alterei o telhado"
    data_upload = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.arquivo.nome} - v{self.numero_versao}"