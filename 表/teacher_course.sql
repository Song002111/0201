/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : certificate

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 10/05/2025 20:36:24
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for teacher_course
-- ----------------------------
DROP TABLE IF EXISTS `teacher_course`;
CREATE TABLE `teacher_course`  (
  `teacher_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `course_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`teacher_id`, `course_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of teacher_course
-- ----------------------------
INSERT INTO `teacher_course` VALUES ('1001', 'C101');
INSERT INTO `teacher_course` VALUES ('t002', 'C102');
INSERT INTO `teacher_course` VALUES ('t003', 'C103');
INSERT INTO `teacher_course` VALUES ('t003', 'C108');
INSERT INTO `teacher_course` VALUES ('t003', 'C109');
INSERT INTO `teacher_course` VALUES ('t003', 'C110');
INSERT INTO `teacher_course` VALUES ('t004', 'C104');
INSERT INTO `teacher_course` VALUES ('t004', 'CS107');

SET FOREIGN_KEY_CHECKS = 1;
