import unittest
import urllib.request
from erx_client import ErxClient, _CredentialSafeRedirect


class CredentialRedirectTests(unittest.TestCase):
    def redirect(self, source, target):
        request = urllib.request.Request(source, headers={"Authorization": "Bearer test-key", "Accept": "application/json"})
        return _CredentialSafeRedirect().redirect_request(request, None, 302, "Found", {}, target)

    def test_same_origin_keeps_credential(self):
        result = self.redirect("https://api.example.com/start", "https://api.example.com:443/next")
        self.assertEqual(result.get_header("Authorization"), "Bearer test-key")

    def test_other_origins_never_receive_credential(self):
        for target in ["https://other.example.com/next", "http://api.example.com/next", "https://api.example.com:444/next"]:
            with self.subTest(target=target):
                result = self.redirect("https://api.example.com/start", target)
                self.assertIsNone(result.get_header("Authorization"))
                self.assertEqual(result.get_header("Accept"), "application/json")

    def test_default_client_installs_safe_handler(self):
        client = ErxClient(api_key="test-key")
        self.assertTrue(any(isinstance(handler, _CredentialSafeRedirect) for handler in client._opener.handlers))
        self.assertNotIn("test-key", repr(client))


if __name__ == "__main__":
    unittest.main()
