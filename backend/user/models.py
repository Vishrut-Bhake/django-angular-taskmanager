from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # Hashes password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractUser):
    """Single user model with email authentication & roles"""
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    
    ROLE_CHOICES = (
        ('viewer', 'Viewer'),   # View-only access
        ('editor', 'Editor'),   # Full CRUD access
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='editor')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'  # Change authentication field to email
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


