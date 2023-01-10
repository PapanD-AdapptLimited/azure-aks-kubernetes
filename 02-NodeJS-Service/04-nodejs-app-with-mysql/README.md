

cd mysql

# Bring Up
docker-compose -f docker-compose.yaml up -d

# Bring down
docker-compose -f docker-compose.yaml down --volume


# Connection Docker Container
docker exec -it mysqldb bash
docker exec -it mysqldb mysql -uroot -pdbpassword11
docker exec -it mysqldb mysql --host=localhost --user=mysqluser --password=mysqlpass

# MySQL DB root
mysql -uroot -pdbpassword11
mysql --host=localhost --user=mysqluser --password=mysqlpass


SHOW DATABASES;
USE webappdb;
SHOW TABLES;
SELECT id FROM users;

# change the root server password to protect your sensitive information
ALTER USER 'root'@'localhost' IDENTIFIED BY 'mysqlpass';
ALTER USER 'root'@'localhost' IDENTIFIED BY 'dbpassword11'; 
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dbpassword11';

FLUSH PRIVILEGES;


# EXIT
quit;
exit;



GRANT ALL PRIVILEGES ON *.* TO 'root'@'172.27.0.1' WITH GRANT OPTION;