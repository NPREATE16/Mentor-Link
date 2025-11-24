import axios from 'axios';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

function getAuthToken() {
  return localStorage.getItem('token');
}

const graphqlClient = axios.create({
  baseURL: GRAPHQL_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Authorization header for each request
graphqlClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error interceptor
graphqlClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('GraphQL Client Error:', error.message, error.response?.data);
    throw error;
  }
);

export async function getAvailableCourses() {
  try {
    const query = `
      query {
        getAvailableCourses {
          id
          name
          faculty
        }
      }
    `;
    
    const response = await graphqlClient.post('', { query });
    
    if (response.data.errors) {
      console.error('GraphQL Error:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }
    
    return response.data.data.getAvailableCourses || [];
  } catch (err) {
    console.error('Error fetching available courses:', err.message);
    throw err;
  }
}

export async function getRegisteredCourses() {
  try {
    const query = `
      query {
        getRegisteredCourses {
          id
          name
          faculty
          content
          reference
        }
      }
    `;
    
    const response = await graphqlClient.post('', { query });
    
    if (response.data.errors) {
      console.error('GraphQL Error:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }
    
    return response.data.data.getRegisteredCourses || [];
  } catch (err) {
    console.error('Error fetching registered courses:', err.message);
    throw err;
  }
}

export async function enrollCourse(courseId) {
  try {
    const mutation = `
      mutation {
        enrollCourse(id: "${courseId}")
      }
    `;
    
    const response = await graphqlClient.post('', { query: mutation });
    
    if (response.data.errors) {
      console.error('GraphQL Error:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }
    
    return response.data.data.enrollCourse;
  } catch (err) {
    console.error('Error enrolling course:', err.message);
    throw err;
  }
}

export async function cancelEnrollCourse(courseId) {
  try {
    const mutation = `
      mutation {
        cancelEnrollCourse(courseId: "${courseId}")
      }
    `;
    
    const response = await graphqlClient.post('', { query: mutation });
    
    if (response.data.errors) {
      console.error('GraphQL Error:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }
    
    return response.data.data.cancelEnrollCourse;
  } catch (err) {
    console.error('Error canceling course enrollment:', err.message);
    throw err;
  }
}
