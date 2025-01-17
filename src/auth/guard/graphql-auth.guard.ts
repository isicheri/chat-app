import { CanActivate,ExecutionContext,Injectable,UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
    constructor(
        private jwtService:JwtService,
        private configService:ConfigService
    ) {}
    async canActivate(context: ExecutionContext):Promise<boolean> {
        const gqlCtx = context.getArgByIndex(2);
        const req:Request = gqlCtx.req;
        const token = this.extractTokenFromCookie(req)
        if(!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token,{secret: this.configService.get<string>("ACCESS_TOKEN_SECRET")});
            req["user"] = payload;
        } catch (error) {
            console.log('err',error)
            throw new UnauthorizedException()
        }
        return true
    }

    private extractTokenFromCookie(req:Request):string | undefined {
        return req.cookies?.access_token;
    }
}