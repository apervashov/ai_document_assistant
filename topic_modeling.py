import os
from pinecone import Pinecone, ServerlessSpec


pc = Pinecone(
    api_key="b3850478-e5f2-4f02-8681-c7ac1184f1e4"
)

index_name = "briliant-test1"
dimension = 768


if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=dimension,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )


index = pc.Index(index_name)

def get_documents_from_pinecone():
    results = index.query(
        vector=[0] * 768,
        top_k=100,
        include_metadata=True
    )
    documents = [res['metadata']['text'] for res in results['matches']]
    return documents, [res['id'] for res in results['matches']]

def perform_topic_modeling(documents, num_topics=5):

    texts = [[word for word in doc.lower().split()] for doc in documents]


    dictionary = corpora.Dictionary(texts)
    corpus = [dictionary.doc2bow(text) for text in texts]


    lda_model = models.LdaModel(corpus, num_topics=num_topics, id2word=dictionary, passes=15)
    topics = lda_model.print_topics(num_words=4)
    return topics, lda_model


def update_pinecone_with_topics(doc_ids, lda_model, dictionary):
    for doc_id in doc_ids:

        doc_topics = lda_model.get_document_topics(dictionary.doc2bow(doc_id.lower().split()))
        topics = [f"topic_{idx}" for idx, _ in sorted(doc_topics, key=lambda x: -x[1])[:3]]  # Извлекаем 3 основные темы


        index.update(doc_id, {"metadata": {"topics": topics}})
        print(f"Metadata for document {doc_id} were updated with topics:{topics}")


def main():

    documents, doc_ids = get_documents_from_pinecone()
    
    if not documents:
        print("No documents to process.")
        return


    topics, lda_model = perform_topic_modeling(documents)


    update_pinecone_with_topics(doc_ids, lda_model, corpora.Dictionary([doc.lower().split() for doc in documents]))
    print("All documents are updated")

if __name__ == "__main__":
    main()
