import React, { useState, createContext, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from '@apollo/client';

// ✅ Apollo Client setup
const client = new ApolloClient({
  uri: 'https://example.com/graphql', // replace with your server URL
  cache: new InMemoryCache(),
});

// ✅ Authentication context
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

const GET_REVIEWS = gql`
  query {
    reviews {
      id
      text
      rating
      user {
        username
      }
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation createReview($repositoryName: String!, $ownerName: String!, $rating: Int!, $text: String!) {
    createReview(review: { repositoryName: $repositoryName, ownerName: $ownerName, rating: $rating, text: $text }) {
      id
      text
      rating
    }
  }
`;

// ✅ Login form
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const [login] = useMutation(LOGIN);

  const handleLogin = async () => {
    try {
      const { data } = await login({ variables: { username, password } });
      setUser(data.login.user);
    } catch (error) {
      console.log('Login failed:', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

// ✅ Review list
function ReviewList() {
  const { loading, error, data } = useQuery(GET_REVIEWS);

  if (loading) return <Text>Loading reviews...</Text>;
  if (error) return <Text>Error loading reviews</Text>;

  return (
    <FlatList
      data={data.reviews}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.reviewItem}>
          <Text style={styles.bold}>{item.user.username}</Text>
          <Text>Rating: {item.rating}</Text>
          <Text>{item.text}</Text>
        </View>
      )}
    />
  );
}

// ✅ Review form
function ReviewForm() {
  const [repositoryName, setRepositoryName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [rating, setRating] = useState('');
  const [text, setText] = useState('');
  const [createReview] = useMutation(CREATE_REVIEW);

  const handleSubmit = async () => {
    try {
      await createReview({
        variables: { repositoryName, ownerName, rating: Number(rating), text },
      });
      alert('Review submitted!');
      setRepositoryName('');
      setOwnerName('');
      setRating('');
      setText('');
    } catch (error) {
      console.log('Error submitting review:', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Repository name" value={repositoryName} onChangeText={setRepositoryName} style={styles.input} />
      <TextInput placeholder="Owner name" value={ownerName} onChangeText={setOwnerName} style={styles.input} />
      <TextInput placeholder="Rating (0-100)" value={rating} onChangeText={setRating} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Review text" value={text} onChangeText={setText} style={styles.input} />
      <Button title="Submit review" onPress={handleSubmit} />
    </View>
  );
}

// ✅ Main App
export default function App() {
  const [user, setUser] = useState(null);

  return (
    <ApolloProvider client={client}>
      <AuthContext.Provider value={{ user, setUser }}>
        <View style={styles.container}>
          {!user ? (
            <>
              <Text style={styles.title}>Login</Text>
              <LoginForm />
            </>
          ) : (
            <>
              <Text style={styles.title}>Welcome, {user.username}</Text>
              <ReviewForm />
              <ReviewList />
            </>
          )}
        </View>
      </AuthContext.Provider>
    </ApolloProvider>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eef6f7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  reviewItem: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
});
