# GraphQL Organogram

    Projeto base para desenvolvimento da feature de organograma.

#### Clone o repositório para seu ambiente local de desenvolvimento

    git clone git@github.com:danielalves96/graphql-organogram.git

#### Faça a instalação das dependências dos projetos

    ```bash
    cd graphql-organogram
    ```

    ```bash
    npm install
    ```

    ```bash
    cp .env.example .env
    ```

    ```bash
    cd database
    ```

    ```bash
    docker compose up -d
    ```

     ```bash
    cd ../
    ```

    ```bash
    npx prisma migrate dev --name init
    ```

    Then simply run:

    ```bash
    npm run dev
    ```
