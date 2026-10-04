from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from gestao.models import Cliente, Projeto, Arquivo, Pasta, Tarefa


class SecurityAndIsolationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 1. Usuário Arquiteto (Staff / Equipe)
        self.arquiteto = User.objects.create_user(
            username='arquiteto@teste.com',
            email='arquiteto@teste.com',
            password='Password123!',
            is_staff=True,
            is_active=True
        )

        # 2. Usuário Cliente 1 e seu registro de Cliente
        self.user_cliente1 = User.objects.create_user(
            username='cliente1@teste.com',
            email='cliente1@teste.com',
            password='Password123!',
            is_active=True
        )
        self.cliente1 = Cliente.objects.create(
            usuario=self.user_cliente1,
            nome='Cliente Um',
            telefone='18999990001',
            codigo_acesso='CLI1001'
        )

        # 3. Usuário Cliente 2 e seu registro de Cliente
        self.user_cliente2 = User.objects.create_user(
            username='cliente2@teste.com',
            email='cliente2@teste.com',
            password='Password123!',
            is_active=True
        )
        self.cliente2 = Cliente.objects.create(
            usuario=self.user_cliente2,
            nome='Cliente Dois',
            telefone='18999990002',
            codigo_acesso='CLI1002'
        )

        # Projetos
        self.proj1 = Projeto.objects.create(cliente=self.cliente1, nome_projeto="Projeto Residencial 1")
        self.proj2 = Projeto.objects.create(cliente=self.cliente2, nome_projeto="Projeto Comercial 2")

        # Arquivos no Projeto 1 (um visível ao cliente, outro interno do arquiteto)
        dummy_file1 = SimpleUploadedFile("planta_visivel.pdf", b"dummy content", content_type="application/pdf")
        dummy_file2 = SimpleUploadedFile("orcamento_interno.pdf", b"secret content", content_type="application/pdf")

        self.arq_visivel = Arquivo.objects.create(
            projeto=self.proj1,
            nome="Planta Visível",
            arquivo=dummy_file1,
            visivel_cliente=True,
            status_aprovacao="PENDENTE"
        )
        self.arq_interno = Arquivo.objects.create(
            projeto=self.proj1,
            nome="Orçamento Interno",
            arquivo=dummy_file2,
            visivel_cliente=False,
            status_aprovacao="PENDENTE"
        )

    def test_arquiteto_can_view_all_projects_and_files(self):
        """Arquiteto deve ter visibilidade total (todos os projetos e arquivos)."""
        self.client.force_authenticate(user=self.arquiteto)

        res_proj = self.client.get('/api/projetos/', secure=True)
        self.assertEqual(res_proj.status_code, status.HTTP_200_OK)
        ids_proj = [p['id'] for p in res_proj.data]
        self.assertIn(self.proj1.id, ids_proj)
        self.assertIn(self.proj2.id, ids_proj)

        res_arq = self.client.get('/api/arquivos/', secure=True)
        self.assertEqual(res_arq.status_code, status.HTTP_200_OK)
        ids_arq = [a['id'] for a in res_arq.data]
        self.assertIn(self.arq_visivel.id, ids_arq)
        self.assertIn(self.arq_interno.id, ids_arq)

    def test_client_only_views_own_projects(self):
        """Cliente 1 só deve visualizar seus próprios projetos (RLS)."""
        self.client.force_authenticate(user=self.user_cliente1)

        res = self.client.get('/api/projetos/', secure=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [p['id'] for p in res.data]
        self.assertIn(self.proj1.id, ids)
        self.assertNotIn(self.proj2.id, ids)

    def test_client_cannot_access_other_client_project_directly_idor(self):
        """Tentativa de IDOR do Cliente 1 no Projeto do Cliente 2 deve retornar 404."""
        self.client.force_authenticate(user=self.user_cliente1)

        res = self.client.get(f'/api/projetos/{self.proj2.id}/', secure=True)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_client_only_sees_visible_files(self):
        """Cliente 1 não deve visualizar arquivos marcados como visivel_cliente=False."""
        self.client.force_authenticate(user=self.user_cliente1)

        res = self.client.get('/api/arquivos/', secure=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [a['id'] for a in res.data]
        self.assertIn(self.arq_visivel.id, ids)
        self.assertNotIn(self.arq_interno.id, ids)

    def test_client_cannot_access_internal_file_directly_idor(self):
        """Tentativa de IDOR em arquivo interno do arquiteto deve retornar 404."""
        self.client.force_authenticate(user=self.user_cliente1)

        res = self.client.get(f'/api/arquivos/{self.arq_interno.id}/', secure=True)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_auth_rate_limiting(self):
        """Verifica se rotas sensíveis com throttle_scope='auth' bloqueiam na 6ª tentativa por minuto (HTTP 429)."""
        from django.core.cache import cache
        cache.clear()

        # As primeiras 5 tentativas devem passar pelo throttle (retornam erro de validação de dados, não de throttle)
        for _ in range(5):
            res = self.client.post(
                '/api/auth/ativar-conta/',
                {'email': 'test@example.com', 'codigo': '000000'},
                secure=True
            )
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # A 6ª tentativa no mesmo minuto DEVE ser bloqueada com 429 Too Many Requests
        res_blocked = self.client.post(
            '/api/auth/ativar-conta/',
            {'email': 'test@example.com', 'codigo': '000000'},
            secure=True
        )
        self.assertEqual(res_blocked.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_upload_dangerous_extension_blocked(self):
        """Upload com extensão perigosa (.exe, .sh, .py, etc.) deve ser rejeitado com 400 Bad Request."""
        self.client.force_authenticate(user=self.arquiteto)
        malicious_file = SimpleUploadedFile("script.py", b"print('hacked')", content_type="text/x-python")

        res = self.client.post(
            '/api/arquivos/',
            {'projeto': self.proj1.id, 'arquivo': malicious_file, 'nome': 'Script Malicioso'},
            format='multipart',
            secure=True
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('arquivo', res.data)

    def test_upload_non_allowed_extension_blocked(self):
        """Upload com extensão fora da whitelist (ex: .mp3, .zip) deve ser rejeitado com 400 Bad Request."""
        self.client.force_authenticate(user=self.arquiteto)
        invalid_file = SimpleUploadedFile("musica.mp3", b"audio data", content_type="audio/mpeg")

        res = self.client.post(
            '/api/arquivos/',
            {'projeto': self.proj1.id, 'arquivo': invalid_file, 'nome': 'Música'},
            format='multipart',
            secure=True
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('arquivo', res.data)

    def test_upload_oversized_file_blocked(self):
        """Upload de arquivo maior que 50MB deve ser rejeitado."""
        from django.core.exceptions import ValidationError
        from gestao.models import validar_arquivo_seguro
        from gestao.serializers import ArquivoSerializer

        class FakeOversizedFile:
            name = "modelo_gigante.rvt"
            size = 51 * 1024 * 1024

        # Validador lança ValidationError diretamente
        with self.assertRaises(ValidationError):
            validar_arquivo_seguro(FakeOversizedFile())

        # Serializer rejeita arquivo maior que 50MB
        serializer = ArquivoSerializer(data={'arquivo': FakeOversizedFile(), 'projeto': self.proj1.id})
        self.assertFalse(serializer.is_valid())
        self.assertIn('arquivo', serializer.errors)

    def test_mass_assignment_protection_on_arquivo(self):
        """Campos como status_aprovacao e tamanho_bytes são protegidos contra Mass Assignment."""
        self.client.force_authenticate(user=self.arquiteto)
        valid_file = SimpleUploadedFile("planta_nova.dwg", b"dwg content", content_type="application/acad")

        # Usuário malicioso tenta forçar 'status_aprovacao': 'APROVADO' e 'tamanho_bytes': 1
        res = self.client.post(
            '/api/arquivos/',
            {
                'projeto': self.proj1.id,
                'arquivo': valid_file,
                'nome': 'Planta Nova',
                'status_aprovacao': 'APROVADO',
                'tamanho_bytes': 1
            },
            format='multipart',
            secure=True
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # O backend forçou 'PENDENTE' e calculou o tamanho real (11 bytes), ignorando o mass assignment
        self.assertEqual(res.data['status_aprovacao'], 'PENDENTE')
        self.assertEqual(res.data['tamanho_bytes'], 11)

    def test_arquiteto_serializer_never_exposes_password(self):
        """Garante que a senha/hash NUNCA é retornada em serializers."""
        from gestao.serializers import ArquitetoSerializer
        serializer = ArquitetoSerializer(self.arquiteto)
        self.assertNotIn('password', serializer.data)
