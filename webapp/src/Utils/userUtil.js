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