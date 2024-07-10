from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model
import requests

class RegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)
    ethereum_wallet_address = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = get_user_model()
        fields = ("first_name", "last_name", "email", "password", "password2", "ethereum_wallet_address")
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def save(self):
        user = get_user_model()(
            email=self.validated_data["email"],
            first_name=self.validated_data["first_name"],
            last_name=self.validated_data["last_name"],
            ethereum_wallet_address=self.validated_data["ethereum_wallet_address"]
        )

        password = self.validated_data["password"]
        password2 = self.validated_data["password2"]

        if password != password2:
            raise serializers.ValidationError(
                {"password": "Passwords do not match!"})

        user.set_password(password)
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        style={"input_type": "password"}, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField() # Define balance as a SerializerMethodField

    class Meta:
        model = get_user_model()
        fields = ("id", "email", "is_staff", "first_name", "last_name", "ethereum_wallet_address", "balance")

    def get_balance(self, obj):
        INFURA_API_KEY = 'dd271ba0e16340748ef955b53b3f613d'  # Replace with your actual Infura API key
        address = obj.ethereum_wallet_address
        if address:
            try:
                response = requests.post(
                    'https://mainnet.infura.io/v3/' + INFURA_API_KEY,
                    headers={'Content-Type': 'application/json'},
                    json={
                        "jsonrpc": "2.0",
                        "method": "eth_getBalance",
                        "params": [address, "latest"],
                        "id": 1
                    }
                )
                data = response.json()
                if 'result' in data:
                    balance_wei = int(data['result'], 16)
                    return balance_wei / 10**18
                else:
                    print(f"Error fetching balance: Unexpected response from Infura: {data}")
                    return None
            except Exception as e:
                print(f"Error fetching balance: {e}")
                return None
        else:
            return None
