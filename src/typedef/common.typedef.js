export const commonTypeDefs = `#graphql
  input PaginationInput {
    page: Int = 1
    limit: Int = 9
  }

  input SortInput {
    field: String!
    order: SortOrder!
  }

  enum SortOrder {
    ASC
    DESC
  }

  type PageInfo {
    page: Int!
    limit: Int!
    total: Int!
  }
`;
