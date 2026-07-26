from django.db import models

class Cliente(models.Model):
    nome = models.CharField(max_length=150)
    # null=True, blank=True permite que a foto seja opcional para não travar o cadastro
    foto = models.ImageField(upload_to='clientes_fotos/', null=True, blank=True) 
    status = models.CharField(max_length=100, default="Ativo")
    data_cadastro = models.DateTimeField(auto_now_add=True)

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
    progresso = models.IntegerField(default=0) # Porcentagem de 0 a 100
    prazo = models.DateField()
    categoria = models.CharField(max_length=50) # Ex: 3D, Planta Baixa, Prefeitura

    def __str__(self):
        return f"{self.titulo} - {self.cliente.nome}"


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