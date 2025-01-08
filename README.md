# About
This repo shows how to use dify backend-as-a-service and nextjs frontend to build a webpage summarizer and classifier.

![alt text](<Screenshot 2025-01-08 at 6.29.10 PM.png>)

```
git clone https://github.com/langgenius/dify
cd dify
cd docker
cp .env.example .env  # no need to change anything here
docker compose up -d
```

Docker output:

```

harrywang@m1-hw docker % docker compose up -d
[+] Running 28/3
 ✔ api Pulled                                                            101.3s
 ✔ worker Pulled                                                         101.3s
 ✔ web Pulled                                                             29.5s
[+] Running 11/11
 ✔ Network docker_ssrf_proxy_network  Created                              0.0s
 ✔ Network docker_default             Created                              0.0s
 ✔ Container docker-web-1             Started                              3.6s
 ✔ Container docker-sandbox-1         Star...                              3.7s
 ✔ Container docker-ssrf_proxy-1      S...                                 3.7s
 ✔ Container docker-db-1              Started                              3.5s
 ✔ Container docker-weaviate-1        Sta...                               3.6s
 ✔ Container docker-redis-1           Starte...                            3.2s
 ✔ Container docker-api-1             Started                              2.7s
 ✔ Container docker-worker-1          Start...                             2.7s
 ✔ Container docker-nginx-1           Starte...                            3.6s

```
 After running, you can access the Dify dashboard in your browser at http://localhost/install and start the initialization process.

![alt text](<Screenshot 2025-01-08 at 10.50.41 AM.png>)

![alt text](<Screenshot 2025-01-08 at 10.50.58 AM.png>)

![alt text](<Screenshot 2025-01-08 at 10.51.56 AM.png>)


http://localhost/apps

![alt text](<Screenshot 2025-01-08 at 3.40.52 PM.png>)

```
curl -X POST 'http://localhost/v1/workflows/run' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "inputs": {},
    "response_mode": "streaming",
    "user": "abc-123"
}'

```

![alt text](<Screenshot 2025-01-08 at 3.38.27 PM.png>)

![alt text](<Screenshot 2025-01-08 at 3.39.00 PM.png>)


LLM Node has input and output tokens and models information:

```
{
    "event": "node_finished",
    "workflow_run_id": "af79a206-5d14-4ef1-9777-b3961ef9b68f",
    "task_id": "19333be0-3a3d-4573-9003-62d4692f3f76",
    "data": {
        "id": "94af8b7f-4cea-4795-9e97-c66150f28415",
        "node_id": "1723994657605",
        "node_type": "llm",
        "title": "LLM",
        "index": 3,
        "predecessor_node_id": "1723994640824",
        "inputs": null,
        "process_data": {
            "model_mode": "chat",
            "prompts": [
                {
                    "role": "system",
                    "text": "网页内容是: \n\n*****\n\n\nTITLE: The ‚ÄúCAR‚Äù Problem of LLMs\nAUTHORS: Harry Wang\nPUBLISH DATE: None\nTOP_IMAGE_URL: \nTEXT:\n\n\n  April 24, 2024\nWhen I teach Retrieval-Augmented Generation (RAG), I defined the ‚ÄúCAR‚Äù (Credibility, Accuracy, and Recency) problem to outline the common challenges faced by Large Language Models (LLMs) and to help my students easily remember and articulate the need for RAG. üòâ\nThe ‚ÄúCAR‚Äù problem can significantly impact LLMs‚Äô performance and reliability:\n    Credibility: LLMs often lack transparent and traceable reasoning processes, which can affect their credibility. Unlike humans, who can explain and justify their thought processes step-by-step, LLMs generate responses based on language patterns learned from vast datasets without a clear audit trail of the generation process. This can result in users developing mistrust towards LLMs.\n    Accuracy: The Issue of Hallucination. One of the significant challenges with LLMs is their tendency to ‚Äúhallucinate,‚Äù or generate information that is not factually correct. This issue arises because these models prioritize coherence and fluency over factual accuracy, often leading to the creation of plausible but incorrect or misleading content. This can be particularly problematic in settings where accuracy is paramount, such as educational content, medical advice, or news reporting.\n    Recency: Handling of Outdated Information. LLMs are trained on datasets that may not include the most current events or developments, e.g. as of April 2024:\n      gpt-4-turbo-2024-04-09‚Äôs training data is up to Dec 2023\n      gpt-3.5-turbo-0125‚Äôs training data is up to Sep 2021\n    The lag between real-world events and their representation in the training data can limit the usefulness of LLMs in scenarios where up-to-date information is crucial.\nUnderstanding and addressing ‚ÄúCAR‚Äù challenges is essential for improving the effectiveness and reliability of LLMs in various applications.\nRAG together with better prompt engineering offers an innovative approach to mitigating some of the ‚ÄúCAR‚Äù issues of LLMs by combining the internal knowledge of LLMs with dynamic, external data sources such as webpages, files, and databases:\n    Enhancing Credibility through source attribution, i.e., references and citations.\n    Improving Accuracy with proprietary and domain-specific information.\n    Enabling Recency via methods such as Internet searches, integration of up-to-date external data sources, and calling external tool APIs.\nTherefore, teaching RAG should be a critical part of any basic GenAI courses. I used LangChain and ChromaDB to demonstrate basic concepts of RAG by creating a ChatPDF-like Q&A application.\nPS. The featured image for this post is generated using HiddenArt tool from Takin.ai.\n\n\n\n*****\n\n将网页摘要控制在20个字以内\n\n将网页分类为以下类别之一：技术、艺术、学术、其他\n\n输出一个包含key的JSON文档：内容概述和类别",
                    "files": []
                }
            ],
            "model_provider": "openai",
            "model_name": "gpt-4o-mini"
        },
        "outputs": {
            "text": "{\n  \"内容概述\": \"探讨大型语言模型的CAR问题及其解决方案。\",\n  \"类别\": \"学术\"\n}",
            "usage": {
                "prompt_tokens": 672,
                "prompt_unit_price": "0.15",
                "prompt_price_unit": "0.000001",
                "prompt_price": "0.0001008",
                "completion_tokens": 30,
                "completion_unit_price": "0.60",
                "completion_price_unit": "0.000001",
                "completion_price": "0.0000180",
                "total_tokens": 702,
                "total_price": "0.0001188",
                "currency": "USD",
                "latency": 1.1720636680001917
            },
            "finish_reason": "stop"
        },
        "status": "succeeded",
        "error": null,
        "elapsed_time": 1.19563,
        "execution_metadata": {
            "total_tokens": 702,
            "total_price": "0.0001188",
            "currency": "USD"
        },
        "created_at": 1736368332,
        "finished_at": 1736368333,
        "files": [],
        "parallel_id": null,
        "parallel_start_node_id": null,
        "parent_parallel_id": null,
        "parent_parallel_start_node_id": null,
        "iteration_id": null
    }
}
```

The total workflow only has total tokens. 

```
{
    "event": "workflow_finished",
    "workflow_run_id": "af79a206-5d14-4ef1-9777-b3961ef9b68f",
    "task_id": "19333be0-3a3d-4573-9003-62d4692f3f76",
    "data": {
        "id": "af79a206-5d14-4ef1-9777-b3961ef9b68f",
        "workflow_id": "1e02fc57-ab49-4396-ae73-3de4f3e369c0",
        "sequence_number": 4,
        "status": "succeeded",
        "outputs": {
            "网页链接": "https://harrywang.me/car",
            "大语言模型输出": "{\n  \"内容概述\": \"探讨大型语言模型的CAR问题及其解决方案。\",\n  \"类别\": \"学术\"\n}"
        },
        "error": null,
        "elapsed_time": 2.594532043000072,
        "total_tokens": 702,
        "total_steps": 4,
        "created_by": {
            "id": "eff0fe4d-2f27-4edb-a325-6ce62debac7b",
            "user": "abc-123"
        },
        "created_at": 1736368330,
        "finished_at": 1736368333,
        "exceptions_count": 0,
        "files": []
    }
}
```

## Setup and Running

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your Dify API key:
```bash
NEXT_PUBLIC_DIFY_API_KEY=your_difyapi_key_here
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

- `NEXT_PUBLIC_DIFY_API_KEY`: Your Dify API key for authentication
