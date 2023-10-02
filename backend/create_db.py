import psycopg2
import os

DB_NAME = 'postgres'
USERNAME = 'postgres'
PASSWORD = 'postgres'
HOST = 'localhost'
PORT = '5432'
 
# connection establishment
conn = psycopg2.connect(
   database=DB_NAME,
    user=USERNAME,
    password=PASSWORD,
    host=HOST,
    port=PORT
)
 
conn.autocommit = True
 
# Creating a cursor object
cursor = conn.cursor()
 
# query to create a database
sql = ''' CREATE database users '''
 
# executing above query
cursor.execute(sql)
print("Database has been created successfully !!")
 
# Closing the connection
conn.close()
