from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# TABELA DE CLIENTES 
class Cliente(models.Model):
    usuario = models.OneToOneField(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='cliente'
    )
    nome = models.CharField(max_length=200)
    foto = models.URLField(blank=True, null=True)
    codigo_acesso = models.CharField(max_length=8, blank=True, null=True)
    ddi = models.CharField(max_length=5, default="+55")
    ddd = models.CharField(max_length=5, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    deletado = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.codigo_acesso:
            import random, string
            chars = string.ascii_uppercase + string.digits
            while True:
                codigo = ''.join(random.choices(chars, k=6))
                if not Cliente.objects.filter(codigo_acesso=codigo).exists():
                    self.codigo_acesso = codigo
                    break
        else:
            self.codigo_acesso = self.codigo_acesso.strip().upper()
        super().save(*args, **kwargs)

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

# TABELA DE TAREFAS
class Tarefa(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    prazo = models.DateField(blank=True, null=True)
    prioridade = models.CharField(max_length=20, default='normal')
    status = models.CharField(max_length=50, default='WIP')
    progresso = models.IntegerField(default=0)
    arquivado = models.BooleanField(default=False)
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
    visivel_cliente = models.BooleanField(default=False)
    pasta_pai = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subpastas')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} - {self.projeto.nome_projeto}"

import os
from django.core.exceptions import ValidationError

# Limite máximo de tamanho do arquivo: 50MB
TAMANHO_MAXIMO_ARQUIVO_MB = 50
TAMANHO_MAXIMO_ARQUIVO_BYTES = TAMANHO_MAXIMO_ARQUIVO_MB * 1024 * 1024

# Whitelist estrita de extensões permitidas para arquitetura e mídia
EXTENSOES_PERMITIDAS = {
    '.pdf', '.dwg', '.rvt', '.skp', '.jpg', '.jpeg', '.png', '.mp4'
}

# Blacklist de extensões perigosas (scripts executáveis e código malicioso)
EXTENSOES_PERIGOSAS = {
    '.exe', '.sh', '.php', '.py', '.js', '.html', '.bat', '.cmd', '.vbs', '.msi'
}

def validar_arquivo_seguro(arquivo):
    """
    Validador de segurança para uploads de arquivos:
    1. Bloqueia explicitamente extensões executáveis e perigosas (.exe, .sh, .php, etc.).
    2. Restringe a lista branca de extensões permitidas de arquitetura e mídia (.pdf, .dwg, .rvt, .skp, .jpg, .jpeg, .png, .mp4).
    3. Bloqueia arquivos que excedam 50MB.
    """
    nome_arquivo = getattr(arquivo, 'name', '')
    extensao = os.path.splitext(nome_arquivo)[1].lower()

    # 1. Bloqueio imediato de executáveis e scripts maliciosos
    if extensao in EXTENSOES_PERIGOSAS:
        raise ValidationError(
            f"Upload bloqueado por segurança: A extensão '{extensao}' é potencialmente perigosa e proibida."
        )

    # 2. Restrição à lista branca de extensões permitidas
    if extensao not in EXTENSOES_PERMITIDAS:
        permitidas_formatadas = ', '.join(sorted(EXTENSOES_PERMITIDAS))
        raise ValidationError(
            f"Extensão de arquivo não permitida ('{extensao}'). "
            f"Extensões aceitas: {permitidas_formatadas}."
        )

    # 3. Restrição de tamanho máximo de arquivo (50MB)
    tamanho = getattr(arquivo, 'size', None)
    if tamanho and tamanho > TAMANHO_MAXIMO_ARQUIVO_BYTES:
        tamanho_mb = tamanho / (1024 * 1024)
        raise ValidationError(
            f"O arquivo excede o limite máximo permitido de {TAMANHO_MAXIMO_ARQUIVO_MB}MB "
            f"(tamanho detectado: {tamanho_mb:.2f}MB)."
        )


class Arquivo(models.Model):
    STATUS_APROVACAO_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('APROVADO', 'Aprovado'),
        ('REJEITADO', 'Rejeitado'),
    ]

    nome = models.CharField(max_length=255, blank=True, null=True)
    arquivo = models.FileField(
        upload_to='projetos_arquivos/',
        validators=[validar_arquivo_seguro]
    )
    visivel_cliente = models.BooleanField(default=False)
    tamanho_bytes = models.PositiveIntegerField(null=True, blank=True)
    projeto = models.ForeignKey('Projeto', related_name='arquivos', on_delete=models.CASCADE)
    pasta = models.ForeignKey('Pasta', related_name='arquivos', on_delete=models.CASCADE, null=True, blank=True)
    versao_de = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='versoes')
    tarefa = models.ForeignKey('Tarefa', on_delete=models.SET_NULL, null=True, blank=True)
    comentario = models.TextField(blank=True, null=True)
    status_aprovacao = models.CharField(
        max_length=20,
        choices=STATUS_APROVACAO_CHOICES,
        default='PENDENTE'
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # REGRA CRÍTICA DE STACKING: Qualquer novo upload/versão nasce OBRIGATORIAMENTE como 'PENDENTE'
        if not self.pk:
            self.status_aprovacao = 'PENDENTE'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome or self.arquivo.name

class Feedback(models.Model):
    arquivo = models.ForeignKey(Arquivo, related_name='feedbacks', on_delete=models.CASCADE)
    autor_nome = models.CharField(max_length=200)
    comentario = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback de {self.autor_nome} no arquivo {self.arquivo_id}"

class Evento(models.Model):
    titulo = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    data = models.DateField()
    horario = models.TimeField(blank=True, null=True)
    duracao_minutos = models.IntegerField(default=60)
    concluido = models.BooleanField(default=False)
    projeto = models.ForeignKey('Projeto', on_delete=models.SET_NULL, null=True, blank=True, related_name='eventos')
    criado_em = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.concluido is None:
            self.concluido = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.titulo} - {self.data}"

class CodigoValidacao(models.Model):
    TIPO_CHOICES = [
        ('CADASTRO', 'Cadastro'),
        ('RECUPERACAO', 'Recuperação'),
    ]

    email = models.EmailField()
    codigo = models.CharField(max_length=6)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Código {self.tipo} para {self.email}: {self.codigo}"
