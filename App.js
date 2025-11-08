import React, { useState, useContext, createContext } from 'react';
import { Text, TextInput, Button, View, FlatList } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql } from '@apollo/client';

// GraphQL client setup
const client = new ApolloClient({
  uri: 'https://example.com/graphql',
  cache: new InMemoryCache(),
});

// Auth context
const AuthContext = createContext();

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(credentials: { username: $username, password: $password }) {
      accessToken
      user {
        id
        username
      }
    }
  }
`;

const GET_REPOSITORIES = gql`
  query {
    repositories {
      id
      fullName
      reviewCount
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation createReview($repositoryName: String!, $rating: Int!, $text: String) {
    createReview(review: { repositoryName: $repositoryName, rating: $rating, text: $text }) {
      id
      rating
      text
    }
  }
`;

// Login form
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const [login] = useMutation(LOGIN);

  const handleLogin = async () => {
    try {
      const { data } = await login({ variables: { username, password } });
      setUser(data.login.user);
    } catch (e) {
      alert('Login failed');
    }
  };

  return (
    <View>
      <TextInput placeholder="Username" onChangeText={setUsername} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

// Repository list
function RepositoryList() {
  const { loading, error, data } = useQuery(GET_REPOSITORIES);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading repositories</Text>;

  return (
    <FlatList
      data={data.repositories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ marginVertical: 5 }}>
          <Text>{item.fullName}</Text>
          <Text>Reviews: {item.reviewCount}</Text>
        </View>
      )}
    />
  );
}

// Review form
function ReviewForm() {
  const [repositoryName, setRepositoryName] = useState('');
  const [rating, setRating] = useState('');
  const [text, setText] = useState('');
  const [createReview] = useMutation(CREATE_REVIEW);

  const handleSubmit = async () => {
    await createReview({ variables: { repositoryName, rating: Number(rating), text } });
    alert('Review created!');
  };

  return (
    <View>
      <TextInput placeholder="Repository name" onChangeText={setRepositoryName} />
      <TextInput placeholder="Rating (0–100)" onChangeText={setRating} />
      <TextInput placeholder="Review text" onChangeText={setText} />
      <Button title="Submit Review" onPress={handleSubmit} />
    </View>
  );
}

// Main app
function Main() {
  const { user } = useContext(AuthContext);
  return (
    <View style={{ padding: 10 }}>
      {user ? (
        <>
          <Text>Welcome, {user.username}</Text>
          <RepositoryList />
          <ReviewForm />
        </>
      ) : (
        <LoginForm />
      )}
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <ApolloProvider client={client}>
      <AuthContext.Provider value={{ user, setUser }}>
        <Main />
      </AuthContext.Provider>
    </ApolloProvider>
  );
}
