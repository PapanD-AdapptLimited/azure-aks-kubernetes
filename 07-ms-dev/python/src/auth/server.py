import jwt, datetime, os
from flask import Flash, request
from flask_mysqldb import MySQL


server = Flask(__name__)
mysql = MySQL(server)

# Config
server.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST")
server.config["MYSQL_USER"] = os.environ.get("MYSQL_USER")
server.config["MYSQL_PASS"] = os.environ.get("MYSQL_PASS")
server.config["MYSQL_DB"] = os.environ.get("MYSQL_DB")
server.config["MYSQL_PORT"] = os.environ.get("MYSQL_PORT")

@server.route("/login", method=["POST"])
def login():
    auth = request.authorization 
    # auth.username
    # auth.password
    if not auth:
        return "missing credentials", 401

    # Check DB for Username and Password
    cur = mysql.connection.cursor()
    res = cur.execute("SELECT email, password FROM user WHERE email=%s", (auth.username))

    if res > 0:
        user_row = cur.fetchone()
        email = user_row[0]
        password = user_row[1]

        if auth.username != email or auth.password != password:
            return "invalid credentials", 401
        else:
            return createJWT(auth.username, os.environ.get("JWT_SECRET"), True)
    else:
        return "invalid user", 401


def createJWT(username, secret, authz):
    return jwt.encode(
        {
            "username":username,
            "exp":datetime.datetime.now(tx=datetime.timezone.utc) + datetime.timedelta(days=1),
            "iat": datetime.datetime.utcnow(),
            "admin":authz
        },
        secret,
        algorithm="HS256"
    )

@server.route("/validate", method=["POST"])
def validate():
    encoded_jwt = request.headers["Authorization"]
    
    if not encoded_jwt:
        return "missing credentials", 401

    encoded_jwt = encoded_jwt.split(" ")[1]

    try:
        decode = jwt.decode(encoded_jwt, os.environ.get("JWT_SECRET"), algorithm=["HS256"])
    except:
        return "not authorized", 403

    return decode, 200


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=5000)


