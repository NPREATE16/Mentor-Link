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

  type Course {
    id: String! 
    name: String!
    faculty: String!
  }

  type RegisteredCourse {
    id: String!
    name: String!
    faculty: String!
    content: String
    reference: String
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!, type: String!): AuthPayload
    signin(email: String!, password: String!): AuthPayload
    requestOtp(email: String!): RequestOtpResult!
    verifyOtp(email: String!, code: String!): VerifyOtpResult!
    enrollCourse(id: String!): Boolean!
    cancelEnrollCourse(courseId: String!): Boolean!
  }

  type Query {
    checkExistUser(email: String! ): Boolean!
    getCourse: [Course!]!
    getAvailableCourses: [Course!]!
    getRegisteredCourses: [RegisteredCourse!]!
  }
`;