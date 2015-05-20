import random
import json
import os

def generate_document():
    document = {}
    for i in range(100):
        document[i] = random.random()
    return document

def generate_document_array():
    documents = []
    for i in range(100000):
        documents.append(generate_document())
    return documents

f = open('test/data-500000-documents.json', 'w')
f.write(json.dumps(generate_document_array()))
f.close()
