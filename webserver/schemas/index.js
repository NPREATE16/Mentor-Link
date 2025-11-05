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

  type RequestOtpResult {
    success: Boolean!
    expiresAt: String
  }

  type VerifyOtpResult {
    success: Boolean!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!, type: String!): AuthPayload
    signin(email: String!, password: String!): AuthPayload
    requestOtp(email: String!): RequestOtpResult!
    verifyOtp(email: String!, code: String!): VerifyOtpResult!
  }

  type Query {
    checkExistUser(email: String! ): Boolean!
  }
`;