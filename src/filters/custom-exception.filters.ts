import { GraphQLError } from "graphql";
import { ArgumentsHost,Catch,BadRequestException } from "@nestjs/common";
import { GqlExceptionFilter } from "@nestjs/graphql";


@Catch(BadRequestException)
export class GraphqlErrorFilter implements GqlExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
    const response = exception.getResponse();
    if(typeof response == "object") {
  throw new GraphQLError("Validation Error",response);
    }else {
  throw new GraphQLError("Bad Request");
    }
    }
}