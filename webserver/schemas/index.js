export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    type: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!, type: String!): AuthPayload
    signin(email: String!, password: String!): AuthPayload
  }

  type Query {
    _empty: String
  }
`;