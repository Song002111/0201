const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

// 定义路由和对应的控制器函数

// 上传证书
router.post('/uploadCertificate',controllers.uploadCertificate);
// 获取所有证书
router.get('/getAllCertificates', controllers.getAllCertificates);
// 删除证书
router.delete('/deleteCertificate/:id', controllers.deleteCertificate);
// 修改证书
router.put('/updateCertificate/:id', controllers.updateCertificate);
// 查询证书
router.get ('/getCertificate/:id',controllers.getCertificate);

// --------------------------课程
// 获取所有课程
router.get('/getAllCourses', controllers.getAllCourses);
// 课程
router.post('/addCourse',controllers.addCourse);
// 删除
router.delete('/deleteCourse/:id',controllers.deleteCourse);
// 修改
router.put('/updateCourse/:id',controllers.updateCourse);
// 查
router.get('/getCourse/:id',controllers.getCourse);

// --------------------------课表
router.get('/getAllSchedules', controllers.getAllSchedules);
router.post('/addSchedule', controllers.addSchedule);
router.put('/updateSchedule/:id', controllers.updateSchedule);
router.delete('/deleteSchedule/:id', controllers.deleteSchedule);

// --------------------------学分
router.post('/addCredit',controllers.addCredit);
// 查学分
router.get('/getStudentCredits/:id',controllers.getStudentCredits);
// 获取所有学分
router.get('/getAllCredits', controllers.getAllCredits);
// 更新学分
router.put('/updateCredit/:id', controllers.updateCredit);
// 删除学分
router.delete('/deleteCredit/:id', controllers.deleteCredit);

// --------------------------用户
// 超级管理员登录
router.post('/adminLogin', controllers.adminLogin);
// 管理员注册用户
router.post('/registerStudent', controllers.registerStudent);
// 删除
router.delete('/deleteStudent/:id', controllers.deleteStudent);
// 普通用户登入
router.post('/studentLogin', controllers.studentLogin);
// 教师登录
router.post('/teacherLogin', controllers.teacherLogin);
// 普通用户修改密码
router.put('/updateStudentPassword', controllers.updateStudentPassword);

// -----------------------------------成绩
router.get('/getAllGrades', controllers.getAllGrades);
router.post('/addGrade', controllers.addGrade);
router.put('/updateGrade/:id', controllers.updateGrade);
router.delete('/deleteGrade/:id', controllers.deleteGrade);
router.post('/submitUpdateRequest', controllers.submitUpdateRequest);

// 获取所有学生
router.get('/getAllStudents', controllers.getAllStudents);

// 获取指定学生的证书
router.get('/getStudentCertificates/:id', controllers.getStudentCertificates);

// 获取指定学生的成绩
router.get('/getStudentGrades/:id', controllers.getStudentGrades);

// 获取指定学生的课表
router.get('/getStudentSchedules/:id', controllers.getStudentSchedules);

// 学生相关路由
router.get('/getStudent/:id', controllers.getStudent);

// 学生信息更新请求相关路由
router.get('/getPendingUpdateRequest/:id', controllers.getPendingUpdateRequest);
router.get('/getAllUpdateRequests', controllers.getAllUpdateRequests);
router.post('/reviewUpdateRequest', controllers.reviewUpdateRequest);

// 证书推荐相关路由
router.get('/getCertificateRecommendations/:id', controllers.getCertificateRecommendations);

// 证书统计相关路由
router.get('/getCertificateStatistics/:id', controllers.getCertificateStatistics);

// 教师登录
router.post('/teacherLogin', controllers.teacherLogin);
// 教师管理相关路由
router.get('/getTeacherCourses/:teacherId', controllers.getTeacherCourses);
router.get('/getTeacherGrades/:teacherId', controllers.getTeacherGrades);
router.post('/addTeacherGrade', controllers.addTeacherGrade);
// 教师个人信息相关路由
router.get('/getTeacherProfile/:teacherId', controllers.getTeacherProfile);
router.put('/updateTeacherPassword', controllers.updateTeacherPassword);

// 证书类型管理路由
router.get('/getAllCertificateTypes', controllers.getAllCertificateTypes);
router.post('/addCertificateType', controllers.addCertificateType);
router.put('/updateCertificateType/:id', controllers.updateCertificateType);  // 添加这行
router.delete('/deleteCertificateType/:id', controllers.deleteCertificateType);
router.get('/getCertificatesByType/:typeId', controllers.getCertificatesByType);
// 修改路由格式
router.put('/updateCertificateTypeAssignment/:certificateId/:typeId', controllers.updateCertificateTypeAssignment);

// 校历相关路由
router.get('/getAllCalendarEvents', controllers.getAllCalendarEvents);
router.post('/addCalendarEvent', controllers.addCalendarEvent);
router.put('/updateCalendarEvent/:id', controllers.updateCalendarEvent);  // 确保这行正确配置
router.delete('/deleteCalendarEvent/:id', controllers.deleteCalendarEvent);
module.exports = router;