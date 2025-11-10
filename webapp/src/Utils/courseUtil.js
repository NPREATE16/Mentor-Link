import { graphQLRequest } from './request';

export const getCourse = async () => {
    const query = `
        query ExampleQuery {
            getCourse {
                faculty
                id
                name
            }
        }
    `;

    const {data} = await graphQLRequest({
        query
    });
    return data;
}

export const enrollCourse = async (courseid) => {
    const query = `
        mutation EnrollCourse($enrollCourseId: String!) {
            enrollCourse(id: $enrollCourseId)
        }
    `;

    const {data} = await graphQLRequest({
        query, 
        variables: {
            enrollCourseId: courseid,
        }
    })

    return data;
}