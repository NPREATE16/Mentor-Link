import { graphQLRequest } from './request';

export const Signup = async (name, email, password, type) => {
    const query = `
        mutation Signup($name: String!, $email: String!, $password: String!, $type: String!) {
            signup(name: $name, email: $email, password: $password, type: $type) {
                token
                user {
                    email
                    id
                    name
                    type
                }
            }
        }
    `;

    const data = await graphQLRequest({
        query,
        variables: {
            name: name, 
            email: email, 
            password: password, 
            type: type,
        }
    });
    return data;
}

export const findUser = async (email) => {
    const query  = `
        query Query($email: String!) {
            checkExistUser(email: $email)
        }
    `;

    const data = await graphQLRequest({ 
        query, 
        variables: {
            email : email,
        }
    }); 
    return data;
}

export const fetchUserData = async (email) => {
    const query  = `
        query Query($email: String!) {
            getUserByEmail(email: $email) {
                id
                name
                email
                phone
                type
                introduce
                mssv
                major
            }
        }
    `;

    const data = await graphQLRequest({ 
        query, 
        variables: {
            email: email,
        }
    }); 
    return data.data.getUserByEmail;
}

export const Signin = async (email, password) => {
    const query = `
        mutation Signin($email: String!, $password: String!) {
            signin(email: $email, password: $password) {
                token
                user {
                email
                id
                phone
                name
                type
                introduce
                }
            }
        }
    `;
    const data = await graphQLRequest({
        query, 
        variables: {
            email: email, 
            password: password,
        }
    });

    return data;
}

export const requestOtp = async (email) => {
    const query = `
        mutation RequestOtp($email: String!) {
            requestOtp(email: $email) {
                expiresAt
                success
            }
        }
    `;

    const data = await graphQLRequest({
        query, 
        variables: {email: email}
    });
    return data;
}

export const verifyOtp = async (email, code) => {
    const query = `
    mutation VerifyOtp($email: String!, $code: String!) {
        verifyOtp(email: $email, code: $code) {
            success
        }
    }`;

    const data = await graphQLRequest({
        query, 
        variables: {
            email: email, 
            code: code,
        }
    });

    return data?.data?.verifyOtp;
}

export const updateUserData = async (userData) => {
  const query = `
    mutation UpdateUser(
      $id: ID!
      $email: String!
      $full_name: String
      $phone: String
      $introduce: String
      $mssv: String
      $major: String
    ) {
      updateUser(
        id: $id
        email: $email
        full_name: $full_name
        phone: $phone
        introduce: $introduce
        mssv: $mssv
        major: $major
      ) {
        id
        name
        email
        phone
        introduce
        mssv
        major
        type
      }
    }
  `;

    const data = await graphQLRequest({
        query,
        variables: userData,
    });

    return data.data.updateUser;
}