# Oauth2 Gmail API

## Steps to setup

1. Run `npm i`
2. Rename `token.json.example` to `token.json`
3. Generate `client_id` and `client_secret` from the google developer console.
4. Add `from email`, `client_id` and `client_secret` in the JSON file.
5. Run `npm start` to start the application at `http://127.0.0.1:5000`
6. Use postman or similar REST client to request API endpoints.

## How to use

1. Send GET request at `/` endpoint then it will open google oauth consent screen to authenticate a user.
2. After successful authentication required tokens will be saved in the `token.json` file.
3. Finally send POST request at `/sendmail` endpoint with the required parameters in the body.

**Request**

```http
POST /sendmail
Content-Type: application/json
Host: 127.0.0.1:5000

{
	"to": "<required>",
	"sub": "API Testing",
	"msg": "Hello World"
}
```

**Response**

```
Mail Sent!
```
