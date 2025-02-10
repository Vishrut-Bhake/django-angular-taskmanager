from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import RegisterSerializer, LoginSerializer, PasswordResetSerializer, ProfileUpdateSerializer
from django.contrib.auth.models import User
from django.contrib.auth.forms import PasswordResetForm
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "Response": {
                    "Message": "Register Successfully"
                },
                "User": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        """Change User Password"""
        user = request.user
        data = request.data

        old_password = data.get('old_password')
        new_password = data.get('new_password')

        # Verify old password
        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully!"}, status=status.HTTP_200_OK)

class ProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request):
        """Update User Profile"""
        user = request.user
        data = request.data
        try:
        # Ensure email uniqueness
            if 'email' in data and User.objects.filter(email=data['email']).exclude(id=user.id).exists():
                return Response({"error": "Email already in use."}, status=status.HTTP_400_BAD_REQUEST)
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.email = data.get('email', user.email)
            user.save()
            return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a token and link for password reset
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(user.pk.encode())
        reset_link = f"http://yourfrontend.com/reset-password/{uid}/{token}"

        # Send email to the user
        send_mail(
            'Password Reset',
            f'Click the link below to reset your password:\n{reset_link}',
            'no-reply@yourdomain.com',
            [email]
        )
        return Response({"detail": "Password reset email sent."}, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
        def post(self, request):
            email = request.data.get("email")

            if not email:
                return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"detail": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))  
            token = default_token_generator.make_token(user)

            reset_url = f"http://127.0.0.1:4200/reset-password/{uidb64}/{token}/"
            send_mail(
                subject="Password Reset Request",
                message=f"Click the link to reset your password: {reset_url}",
                from_email="noreply@example.com",
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({"detail": "Password reset link sent to your email."}, status=status.HTTP_200_OK)