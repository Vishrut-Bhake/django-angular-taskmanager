from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number']

# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone_number']

    def create(self, validated_data):
        try:
            user = User.objects.create_user(**validated_data)
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Error creating user: {str(e)}")

# Login Serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            email = data.get("email")
            password = data.get("password")
            
            # Fetch user by email
            user = User.objects.filter(email=email).first()
            if user and user.check_password(password):
                # Generate JWT tokens if credentials are valid
                refresh = RefreshToken.for_user(user)
                return {
                    "user": UserSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "role": user.role  # Include user role
                }
            raise serializers.ValidationError("Invalid credentials provided.")

        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        except Exception as e:
            raise serializers.ValidationError(f"An error occurred: {str(e)}")

# Password Reset Serializer
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            if not User.objects.filter(email=value).exists():
                raise serializers.ValidationError("No user associated with this email.")
            return value
        except Exception as e:
            raise serializers.ValidationError(f"Error in email validation: {str(e)}")

# Profile Update Serializer
class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number']

    def update(self, instance, validated_data):
        try:
            instance.first_name = validated_data.get('first_name', instance.first_name)
            instance.last_name = validated_data.get('last_name', instance.last_name)
            instance.phone_number = validated_data.get('phone_number', instance.phone_number)
            instance.save()
            return instance
        except Exception as e:
            raise serializers.ValidationError(f"Error updating profile: {str(e)}")
