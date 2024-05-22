const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Query {
    departments(filter: DepartmentFilterInput, search: String, pageSize: Int, currentPage: Int): DepartmentsResponse
    people(filter: PersonFilterInput, search: String, pageSize: Int, currentPage: Int): PeopleResponse
    departmentDetails(departmentId: ID!): DepartmentResponse
    personDetails(personId: ID!): PersonResponse  # Nova query adicionada aqui
  }

  type PaginatedDepartments {
    totalResults: Int
    totalPages: Int
    currentPage: Int
    results: [Department]
  }

  type PaginatedPeople {
    totalResults: Int
    totalPages: Int
    currentPage: Int
    results: [Person]
  }

  type Department {
    id: ID!
    name: String
    code: String
    type: String
    numberOfPeople: Int
    enabled: Boolean
    people: [Person]
    children: [Department]
  }

  type Person {
    id: ID!
    name: String
    phone: String
    cpf: String
    departments: [Department]
  }

  input DepartmentFilterInput {
    name: String
    code: String
    type: String
    enabled: Boolean
  }

  input PersonFilterInput {
    name: String
    phone: String
    cpf: String
  }

  input CreateDepartmentInput {
    name: String!
    code: String!
    type: String!
    enabled: Boolean!
    parentId: ID
  }

  input UpdateDepartmentInput {
    id: ID!
    name: String
    code: String
    type: String
    enabled: Boolean
    parentId: ID
  }

  type Mutation {
    addPersonToDepartment(personId: ID!, departmentId: ID!): MutationResponse
    removePersonFromDepartment(personId: ID!, departmentId: ID!): MutationResponse
    activateDepartment(departmentId: ID!): MutationResponse
    deactivateDepartment(departmentId: ID!): MutationResponse
    addChildDepartment(parentDepartmentId: ID!, childDepartmentId: ID!): MutationResponse
    removeChildDepartment(parentDepartmentId: ID!, childDepartmentId: ID!): MutationResponse
    createDepartment(input: CreateDepartmentInput!): DepartmentResponse
    updateDepartment(input: UpdateDepartmentInput!): DepartmentResponse
  }

  type MutationResponse {
    statusCode: Int
    status: String
    message: String
  }

  type DepartmentResponse {
    statusCode: Int
    status: String
    message: String
    result: Department
  }

  type PersonResponse {
    statusCode: Int
    status: String
    message: String
    result: Person
  }

  type DepartmentsResponse {
    statusCode: Int
    status: String
    message: String
    totalResults: Int
    totalPages: Int
    currentPage: Int
    results: [Department]
  }

  type PeopleResponse {
    statusCode: Int
    status: String
    message: String
    totalResults: Int
    totalPages: Int
    currentPage: Int
    results: [Person]
  }
`;

module.exports = { typeDefs };
