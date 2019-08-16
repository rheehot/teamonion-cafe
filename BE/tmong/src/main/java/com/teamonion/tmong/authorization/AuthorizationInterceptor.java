package com.teamonion.tmong.authorization;

import com.teamonion.tmong.exception.AuthorizationExceptionType;
import com.teamonion.tmong.exception.GlobalException;
import com.teamonion.tmong.member.MemberRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class AuthorizationInterceptor extends HandlerInterceptorAdapter {
    private static final Logger log = LoggerFactory.getLogger(AuthorizationInterceptor.class);
    private static final String AUTHORIZATION_TYPE = "Bearer";

    @Autowired
    private JwtComponent jwtComponent;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // like swagger
        if (!(handler instanceof HandlerMethod)) {
            log.debug("handler : {}", handler);
            return true;
        }

        CheckJwt checkJwt = ((HandlerMethod) handler).getMethodAnnotation(CheckJwt.class);
        if (checkJwt == null) {
            return true;
        }

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith(AUTHORIZATION_TYPE)) {
            throw new GlobalException(AuthorizationExceptionType.UNAUTHORIZED);
        }

        String jwt = authorization.substring(AUTHORIZATION_TYPE.length()).trim();
        jwtComponent.checkTokenValidation(jwt);
        if (checkJwt.role().equals(MemberRole.ADMIN)) {
            jwtComponent.checkAdmin();
        }
        return true;
    }
}
