// const express = require('express');
// const app = express();
// const jwt = require('jsonwebtoken');

// const UserModel = require("../server/User/UserModel");

// // Define your middleware function with a parameter
// const roleAuthentication = (params) => {

//     return async (req, res, next) => {
//         let handler = new ApiHandler(req, res);
//         let userInfo = jwt.decode(req.headers.authorization.split("Bearer ")[1]);
//         let userFind = await new UserModel().where({ email: userInfo.email }).orderBy('id', 'desc').fetchAll();
//         req.userID = userFind.toJSON()[0].id;
//         req.teamId = userFind.toJSON()[0].team_id;

//         let allowed_role = params.allowed;
//         let not_allowed_role = params.not_allowed;
//         let currentUserRole = userInfo.resource_access[`${process.env.clientId}`].roles[0];

//         // for the Role Permission
//         if ((allowed_role.length > 0 && !allowed_role.includes(currentUserRole)) ||
//             (not_allowed_role.length > 0 && not_allowed_role.includes(currentUserRole))
//         ) {
//             return handler.error('You are not authorized')
//         }

//         //for the Club Permission
//         var matchedValue = ['team_id', 'club_id'].find(route => req.route.path.includes(route));
//         if (matchedValue && userInfo.attributes.vv_club_id != req.params[matchedValue]) {
//             return handler.error('You are not authorized')
//         }
//         next();
//     };
// };


// module.exports = roleAuthentication;
