# GraphQL Organogram

    Projeto base para desenvolvimento da feature de organograma.

#### Clone o repositório para seu ambiente local de desenvolvimento

    git clone git@github.com:danielalves96/graphql-organogram.git

#### Faça a instalação das dependências dos projetos

    cd graphql-organogram

    npm install

    cp .env.example .env

    cd database

    docker compose up -d

    cd ../

    npx prisma migrate dev --name init

    npm run dev

#### Queries e mutations disponíveis

departmentsList

    query departmentsList($filter: DepartmentFilterInput, $search: String, $pageSize: Int, $currentPage: Int) {
      departments(filter: $filter, search: $search, pageSize: $pageSize, currentPage: $currentPage) {
        totalResults
        totalPages
        currentPage
        results {
          ...DepartmentWithChildrenFields
        }
      }
    }

    fragment DepartmentBaseFields on Department {
      id
      name
      code
      type
      numberOfPeople
      enabled
      people {
        id
        name
        phone
        cpf
      }
    }

    fragment DepartmentWithChildrenFields on Department {
      ...DepartmentBaseFields
      children {
        ...DepartmentBaseFields
        children {
          ...DepartmentBaseFields
          children {
            ...DepartmentBaseFields
            children {
              ...DepartmentBaseFields
              children {
                ...DepartmentBaseFields
                children {
                  ...DepartmentBaseFields
                  children {
                    ...DepartmentBaseFields
                    children {
                      ...DepartmentBaseFields
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

departmentGetById

    query departmentGetById($departmentId: ID!) {
        departmentDetails(departmentId: $departmentId) {
            statusCode
            status
            message
            result {
            ...DepartmentWithChildrenFields
            }
        }
    }

    fragment DepartmentBaseFields on Department {
        id
        name
        code
        type
        numberOfPeople
        enabled
        people {
            id
            name
            phone
            cpf
        }
    }

    fragment DepartmentWithChildrenFields on Department {
    ...DepartmentBaseFields
    children {
        ...DepartmentBaseFields
        children {
        ...DepartmentBaseFields
        children {
            ...DepartmentBaseFields
            children {
            ...DepartmentBaseFields
            children {
                ...DepartmentBaseFields
                children {
                ...DepartmentBaseFields
                children {
                    ...DepartmentBaseFields
                }
                }
            }
            }
        }
        }
    }
    }

peopleList

    query peopleList($filter: PersonFilterInput, $search: String, $pageSize: Int, $currentPage: Int) {
        people(filter: $filter, search: $search, pageSize: $pageSize, currentPage: $currentPage) {
            totalResults
            totalPages
            currentPage
            results {
                id
                name
                phone
                cpf
                departments {
                id
                name
                }
            }
        }
    }

createDepartment

    mutation createDepartment($input: CreateDepartmentInput!) {
        createDepartment(input: $input) {
            status
            message
            result {
                id
                name
                code
                type
                enabled
            }
        }
    }

updateDepartment

    mutation updateDepartment($input: UpdateDepartmentInput!) {
        updateDepartment(input: $input) {
            status
            message
            result {
                id
                name
                code
                type
                enabled
            }
        }
    }

addPersonToDepartment

    mutation addPersonToDepartment($personId: ID!, $departmentId: ID!) {
        addPersonToDepartment(personId: $personId, departmentId: $departmentId) {
            status
            message
        }
    }

removePersonFromDepartment

    mutation removePersonFromDepartment($personId: ID!, $departmentId: ID!) {
        removePersonFromDepartment(personId: $personId, departmentId: $departmentId) {
            status
            message
        }
    }

activateDepartment

    mutation activateDepartment($departmentId: ID!) {
        activateDepartment(departmentId: $departmentId) {
            status
            message
        }
    }

deactivateDepartment

    mutation deactivateDepartment($departmentId: ID!) {
        deactivateDepartment(departmentId: $departmentId) {
            status
            message
        }
    }

addChildDepartment

    mutation addChildDepartment($parentDepartmentId: ID!, $childDepartmentId: ID!) {
        addChildDepartment(parentDepartmentId: $parentDepartmentId, childDepartmentId: $childDepartmentId) {
            status
            message
        }
    }

removeChildDepartment

    mutation removeChildDepartment($parentDepartmentId: ID!, $childDepartmentId: ID!) {
        removeChildDepartment(parentDepartmentId: $parentDepartmentId, childDepartmentId: $childDepartmentId) {
            status
            message
        }
    }
