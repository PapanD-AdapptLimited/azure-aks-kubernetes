

cd mysql

# Bring Up
docker-compose -f docker-compose.yaml up -d

# Bring down
docker-compose -f docker-compose.yaml down --volume


# Connection Docker Container
docker exec -it mysqldb bash

# MySQL DB root
mysql -uroot -pdbpassword11
mysql --host=localhost --user=mysqluser --password=mysqlpass


SHOW DATABASES;
USE webappdb;
SHOW TABLES;
SELECT id FROM users;

# change the root server password to protect your sensitive information
ALTER USER 'root'@'localhost' IDENTIFIED BY '[newpassword]';


# EXIT
quit;
exit;