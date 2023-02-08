from authorisation.service import AuthService
from argon2 import PasswordHasher


class TestAuthService:
    def setup_method(self):
        self.service = AuthService()
        self.hasher = PasswordHasher(time_cost=2, parallelism=1)
        self.password="test_password"
        self.wrong_password="wrong_password"
        self.hashed_password = self.hasher.hash(self.password)

    def test_hash_password(self):
        result= self.service.hash_password(self.password)
        try:
            assert self.hasher.verify(result,self.password)
        except:
            assert False
        try:
            assert not self.hasher.verify(result,self.wrong_password)
        except:
            assert True

    def test_verify_password(self):
        assert self.service.verify_password(self.hashed_password,self.password)
        assert not self.service.verify_password(self.hashed_password,self.wrong_password)

    def test_rehash_password(self):
        assert 'argon' in self.service.rehash_password(hash=self.hashed_password, password=self.password)

        