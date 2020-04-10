const { ApolloServer, gql } = require("apollo-server");
const axios = require("axios");
const Redis = require("ioredis");
const redis = new Redis();

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Movie {
    _id: ID
    title: String
    overview: String
    poster_path: String
    popularity: String
    tags: [String]
  }

  type Query {
    getBooks: [Book]
    getMovies: [Movie]
    getMovie(_id: String): Movie
  }

  type Mutation {
    addMovie(
      title: String
      overview: String
      poster_path: String
      popularity: Int
      tags: [String]
    ): Movie
  }
`;

const books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
];

const resolvers = {
  Query: {
    getBooks: () => books,
    getMovies: async () => {
      const movies = await redis.get("movies");
      if (movies) {
        return JSON.parse(movies);
      } else {
        const { data } = await axios.get("http://localhost:3001/movies");
        redis.set("movies", JSON.stringify(data));
        return data;
      }
    },
    getMovie: async (_, args) => {
      const { data } = await axios.get(
        `http://localhost:3001/movies/${args._id}`
      );
      return data;
    },
  },
  Mutation: {
    addMovie: async (_, args) => {
      const newMovie = {
        title: args.title,
        overview: args.overview,
        poster_path: args.poster_path,
        popularity: args.popularity,
        tags: args.tags,
      };
      const { data } = await axios.post(
        "http://localhost:3001/movies",
        newMovie
      );
      redis.del("movies");
      return data;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
