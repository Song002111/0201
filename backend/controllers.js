const db = require('./db');

// 后端方法
// 添加证书
exports.uploadCertificate = (req, res) => {
    console.log('Received request to upload a certificate');

    // 从前端请求中获取数据
    const { 
        certificate_name, 
        certificate_number, 
        image_url, 
        supporting_document_url, 
        supporting_document_type, 
        uploader_name, 
        student_id,
        certificate_authority 
    } = req.body;

    // 验证请求参数是否完整
    if (!certificate_name || !certificate_number || !uploader_name || !student_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 检查 supporting_document_type 是否符合数据库 ENUM
    const validTypes = ['image', 'pdf', 'word', 'other'];
    if (supporting_document_type && !validTypes.includes(supporting_document_type)) {
        return res.status(400).json({ error: 'Invalid supporting document type' });
    }

    // SQL 插入语句
    const query = `
        INSERT INTO certificates (
            certificate_name, 
            certificate_number, 
            image_url, 
            supporting_document_url, 
            supporting_document_type, 
            uploader_name, 
            student_id,
            certificate_authority,
            uploaded_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
        certificate_name,
        certificate_number,
        image_url || null, // 允许 NULL
        supporting_document_url || null, // 允许 NULL
        supporting_document_type || null, // 允许 NULL
        uploader_name,
        student_id,
        certificate_authority || null // 允许 NULL
    ];

    // 执行 SQL 插入
    db.executeQuery(query, values, (err, result) => {
        if (err) {
            console.error('Failed to upload certificate:', err);
            return res.status(500).json({ error: 'Failed to upload certificate' });
        }

        res.status(201).json({ message: 'Certificate uploaded successfully', certificate_id: result.insertId });
    });
};

// 获取所有证书
exports.getAllCertificates = (req, res) => {
    console.log('Received request to get all certificates');

    const query = 'SELECT * FROM certificates ORDER BY uploaded_at DESC';

    db.executeQuery(query, [], (err, results) => {
        if (err) {
            console.error('Failed to fetch certificates:', err);
            return res.status(500).json({ error: 'Failed to fetch certificates' });
        }

        res.status(200).json({ 
            message: 'Certificates retrieved successfully',
            certificates: results 
        });
    });
};

// 证书删除
exports.deleteCertificate = (req, res) => {
    const certificateId = req.params.id;

    if (!certificateId) {
        return res.status(400).json({ error: 'Certificate ID is required' });
    }

    const query = 'DELETE FROM certificates WHERE id = ?';

    db.executeQuery(query, [certificateId], (err, result) => {
        if (err) {
            console.error('Failed to delete certificate:', err);
            return res.status(500).json({ error: 'Failed to delete certificate' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        res.status(200).json({ 
            message: 'Certificate deleted successfully',
            certificateId: certificateId
        });
    });
};
// 证书修改
exports.updateCertificate = (req, res) => {
    const certificateId = req.params.id;
    const {
        certificate_name,
        certificate_number,
        image_url,
        supporting_document_url,
        supporting_document_type,
        uploader_name,
        student_id,
        certificate_authority
    } = req.body;

    if (!certificateId || isNaN(certificateId)) {
        return res.status(400).json({ error: 'Invalid Certificate ID' });
    }

    // 验证必需字段
    if (!certificate_name || !certificate_number || !image_url || !uploader_name || !student_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        UPDATE certificates 
        SET certificate_name = ?,
            certificate_number = ?,
            image_url = ?,
            supporting_document_url = ?,
            supporting_document_type = ?,
            uploader_name = ?,
            student_id = ?,
            certificate_authority = ?
        WHERE id = ?
    `;

    const values = [
        certificate_name,
        certificate_number,
        image_url,
        supporting_document_url,
        supporting_document_type,
        uploader_name,
        student_id,
        certificate_authority,
        certificateId
    ];

    db.executeQuery(query, values, (err, result) => {
        if (err) {
            console.error('Failed to update certificate:', err);
            return res.status(500).json({ error: 'Failed to update certificate' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        res.status(200).json({
            message: 'Certificate updated successfully',
            certificateId: certificateId
        });
    });
};

// 查询证书
exports.getCertificate = (req, res) => {
    const certificateId = parseInt(req.params.id);

    // 验证证书ID
    if (!certificateId || isNaN(certificateId)) {
        return res.status(400).json({ error: 'Invalid Certificate ID' });
    }

    const query = `
        SELECT * FROM certificates 
        WHERE id = ?
    `;

    db.executeQuery(query, [certificateId], (err, result) => {
        if (err) {
            console.error('Failed to get certificate:', err);
            return res.status(500).json({ error: 'Failed to get certificate' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        res.status(200).json({
            message: 'Certificate retrieved successfully',
            certificate: result[0]
        });
    });
};

// -----------------

// 课程
// 添加课程
exports.addCourse = (req, res) => {
    const { course_id, course_name, credits, class_name } = req.body;

    // 验证必填字段
    if (!course_id || !course_name || !credits || !class_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 验证学分是否为数字
    if (isNaN(credits)) {
        return res.status(400).json({ error: 'Credits must be a number' });
    }

    const query = `
        INSERT INTO courses (course_id, course_name, credits, class_name)
        VALUES (?, ?, ?, ?)
    `;

    db.executeQuery(query, [course_id, course_name, credits, class_name], (err, result) => {
        if (err) {
            // 处理重复课程ID的情况
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Course ID already exists' });
            }
            console.error('Failed to add course:', err);
            return res.status(500).json({ error: 'Failed to add course' });
        }

        res.status(201).json({
            message: 'Course added successfully',
            courseId: course_id
        });
    });
};

// 删除课程
exports.deleteCourse = (req, res) => {
    const courseId = req.params.id;

    if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
    }

    const query = `
        DELETE FROM courses 
        WHERE course_id = ?
    `;

    db.executeQuery(query, [courseId], (err, result) => {
        if (err) {
            console.error('Failed to delete course:', err);
            return res.status(500).json({ error: 'Failed to delete course' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json({
            message: 'Course deleted successfully',
            courseId: courseId
        });
    });
};

// 修改
// 修改课程
exports.updateCourse = (req, res) => {
    const courseId = req.params.id;
    const { course_name, credits, class_name } = req.body;

    if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
    }

    if (!course_name || !credits || !class_name) {
        return res.status(400).json({ error: 'Course name, credits and class name are required' });
    }

    const query = `
        UPDATE courses
        SET course_name = ?, credits = ?, class_name = ?
        WHERE course_id = ?
    `;

    db.executeQuery(query, [course_name, credits, class_name, courseId], (err, result) => {
        if (err) {
            console.error('Failed to update course:', err);
            return res.status(500).json({ error: 'Failed to update course' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json({
            message: 'Course updated successfully',
            courseId: courseId
        });
    });
};

// 查询
exports.getCourse = (req, res) => {
    const courseId = req.params.id;

    if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
    }

    const query = `
        SELECT * FROM courses 
        WHERE course_id = ?
    `;

    db.executeQuery(query, [courseId], (err, results) => {
        if (err) {
            console.error('Failed to get course:', err);
            return res.status(500).json({ error: 'Failed to get course' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json(results[0]);
    });
};

//----------------------------学分
// 添加
exports.addCredit = (req, res) => {
    const { student_id, course_id, course_name, credits } = req.body;

    // 验证必填字段
    if (!student_id || !course_id || !course_name || credits === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // 验证学分是否为正数
    if (credits < 0) {
        return res.status(400).json({ error: 'Credits must be a positive number' });
    }

    const query = `
        INSERT INTO credits (student_id, course_id, course_name, credits)
        VALUES (?, ?, ?, ?)
    `;

    db.executeQuery(query, [student_id, course_id, course_name, credits], (err, result) => {
        if (err) {
            // 检查是否违反外键约束
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ error: 'Invalid student_id or course_id' });
            }
            // 检查是否违反主键约束(重复记录)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Credit record already exists' });
            }
            console.error('Failed to add credit:', err);
            return res.status(500).json({ error: 'Failed to add credit' });
        }

        res.status(201).json({
            message: 'Credit added successfully',
            student_id: student_id,
            course_id: course_id
        });
    });
};

// 查询某一个学生的学分
exports.getStudentCredits = (req, res) => {
    const student_id = req.params.id; // Changed from student_id to id to match route parameter

    if (!student_id) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    const query = `
        SELECT * FROM credits 
        WHERE student_id = ?
    `;

    db.executeQuery(query, [student_id], (err, results) => {
        if (err) {
            console.error('Failed to get student credits:', err);
            return res.status(500).json({ error: 'Failed to get student credits' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No credits found for this student' });
        }

        // 计算总学分
        const totalCredits = results.reduce((sum, record) => sum + record.credits, 0);

        res.status(200).json({
            student_id: student_id,
            credits_records: results,
            total_credits: totalCredits
        });
    });
};

// 获取所有学分记录
exports.getAllCredits = (req, res) => {
    console.log('Received request to get all credits');
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const countQuery = 'SELECT COUNT(*) as total FROM credits';
    
    // 获取统计信息
    const statsQuery = `
        SELECT 
            COUNT(DISTINCT student_id) as totalStudents,
            COUNT(DISTINCT course_id) as totalCourses,
            SUM(credits) as totalCredits
        FROM credits
    `;

    // 获取分页数据
    const dataQuery = `
        SELECT c.*, s.student_name 
        FROM credits c
        LEFT JOIN students s ON c.student_id = s.student_id
        ORDER BY c.student_id, c.course_id
        LIMIT ? OFFSET ?
    `;

    // 执行查询
    db.executeQuery(countQuery, [], (err, countResults) => {
        if (err) {
            console.error('Failed to fetch total count:', err);
            return res.status(500).json({ error: 'Failed to fetch credits' });
        }

        db.executeQuery(statsQuery, [], (err, statsResults) => {
            if (err) {
                console.error('Failed to fetch statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch credits' });
            }

            db.executeQuery(dataQuery, [parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error('Failed to fetch credits:', err);
                    return res.status(500).json({ error: 'Failed to fetch credits' });
                }

                res.status(200).json({
                    credits: results,
                    total: countResults[0].total,
                    totalStudents: statsResults[0].totalStudents,
                    totalCourses: statsResults[0].totalCourses,
                    totalCredits: statsResults[0].totalCredits
                });
            });
        });
    });
};

// 更新学分记录
exports.updateCredit = (req, res) => {
    const { id } = req.params;
    const { student_id, course_id, course_name, credits } = req.body;

    // 验证必填字段
    if (!student_id || !course_id || !course_name || credits === undefined) {
        return res.status(400).json({ error: '所有字段都是必需的' });
    }

    // 验证学分是否为正数
    if (credits < 0) {
        return res.status(400).json({ error: '学分必须为正数' });
    }

    const query = `
        UPDATE credits 
        SET student_id = ?, course_id = ?, course_name = ?, credits = ?
        WHERE id = ?
    `;

    db.executeQuery(query, [student_id, course_id, course_name, credits, id], (err, result) => {
        if (err) {
            console.error('Failed to update credit:', err);
            return res.status(500).json({ error: 'Failed to update credit' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Credit record not found' });
        }

        res.status(200).json({
            message: 'Credit updated successfully',
            id: id
        });
    });
};

// 删除学分记录
exports.deleteCredit = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM credits WHERE id = ?';

    db.executeQuery(query, [id], (err, result) => {
        if (err) {
            console.error('Failed to delete credit:', err);
            return res.status(500).json({ error: 'Failed to delete credit' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Credit record not found' });
        }

        res.status(200).json({
            message: 'Credit deleted successfully',
            id: id
        });
    });
};

// ------------------------用户
// 超级管理员登录
exports.adminLogin = (req, res) => {
    const { username, password } = req.body;

    // 硬编码的管理员凭据
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "admin123"; // 在实际生产环境中应使用加密密码

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.status(200).json({
            message: "Admin login successful",
            isAdmin: true
        });
    } else {
        res.status(401).json({
            error: "Invalid credentials"
        });
    }
};

// 用户注册
exports.registerStudent = (req, res) => {
    const {
        student_id,
        student_name,
        class: className, // 'class' is reserved word in JS
        gender,
        date_of_birth,
        id_card,
        phone_number,
        address
    } = req.body;

    // 设置默认账号和密码
    const account = student_id; // 学号作为账号
    const password = '123'; // 默认密码

    const query = `
        INSERT INTO students (
            student_id,
            student_name,
            class,
            gender,
            date_of_birth,
            id_card,
            phone_number,
            address,
            account,
            password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        student_id,
        student_name,
        className,
        gender,
        date_of_birth,
        id_card,
        phone_number,
        address,
        account,
        password
    ];

    db.executeQuery(query, values, (err, result) => {
        if (err) {
            console.error('Failed to register student:', err);
            return res.status(500).json({ error: 'Failed to register student' });
        }

        res.status(201).json({
            message: 'Student registered successfully',
            student_id: student_id
        });
    });
};
// 删除
exports.deleteStudent = (req, res) => {
    const studentId = req.params.id;

    const query = 'DELETE FROM students WHERE student_id = ?';

    db.executeQuery(query, [studentId], (err, result) => {
        if (err) {
            console.error('Failed to delete student:', err);
            return res.status(500).json({ error: 'Failed to delete student' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    });
};

// 普通用户登入
exports.studentLogin = (req, res) => {
    const { account, password } = req.body;

    if (!account || !password) {
        return res.status(400).json({ error: 'Account and password are required' });
    }

    const query = 'SELECT * FROM students WHERE account = ? AND password = ?';

    db.executeQuery(query, [account, password], (err, results) => {
        if (err) {
            console.error('Failed to login:', err);
            return res.status(500).json({ error: 'Failed to login' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid account or password' });
        }

        const student = results[0];
        res.json({
            message: 'Login successful',
            student_id: student.student_id,
            student_name: student.student_name
        });
    });
};

// 教师登录
exports.teacherLogin = (req, res) => {
    const { account, password } = req.body;

    if (!account || !password) {
        return res.status(400).json({ error: 'Account and password are required' });
    }

    const query = 'SELECT * FROM teachers WHERE teacher_id = ? AND password = ?';

    db.executeQuery(query, [account, password], (err, results) => {
        if (err) {
            console.error('Failed to login:', err);
            return res.status(500).json({ error: 'Failed to login' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid account or password' });
        }

        const teacher = results[0];
        res.json({
            message: 'Login successful',
            teacher_id: teacher.teacher_id,
            name: teacher.name
        });
    });
};

// 普通用户修改
exports.updateStudentPassword = (req, res) => {
    const { student_id, old_password, new_password } = req.body;

    if (!student_id || !old_password || !new_password) {
        return res.status(400).json({ error: 'Student ID, old password and new password are required' });
    }

    // First verify the old password
    const verifyQuery = 'SELECT * FROM students WHERE student_id = ? AND password = ?';
    
    db.executeQuery(verifyQuery, [student_id, old_password], (err, results) => {
        if (err) {
            console.error('Failed to verify password:', err);
            return res.status(500).json({ error: 'Failed to update password' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid student ID or old password' });
        }

        // If old password verified, update to new password
        const updateQuery = 'UPDATE students SET password = ? WHERE student_id = ?';
        
        db.executeQuery(updateQuery, [new_password, student_id], (err, result) => {
            if (err) {
                console.error('Failed to update password:', err);
                return res.status(500).json({ error: 'Failed to update password' });
            }

            res.json({ message: 'Password updated successfully' });
        });
    });
};

// ---------------------成绩
// 成绩录入
exports.addGrade = (req, res) => {
    const { student_id, course_id, score } = req.body;

    // 验证必要字段
    if (!student_id || !course_id || score === undefined) {
        return res.status(400).json({ error: '学生ID、课程ID和成绩都是必需的' });
    }

    // 验证成绩范围
    if (score < 0 || score > 100) {
        return res.status(400).json({ error: '成绩必须在0-100之间' });
    }

    // 首先检查学生是否存在
    const checkStudentQuery = 'SELECT * FROM students WHERE student_id = ?';
    db.executeQuery(checkStudentQuery, [student_id], (err, studentResults) => {
        if (err) {
            console.error('查询学生信息失败:', err);
            return res.status(500).json({ error: '成绩录入失败' });
        }

        if (studentResults.length === 0) {
            return res.status(404).json({ error: '未找到该学生' });
        }

        // 检查课程是否存在
        const checkCourseQuery = 'SELECT * FROM courses WHERE course_id = ?';
        db.executeQuery(checkCourseQuery, [course_id], (err, courseResults) => {
            if (err) {
                console.error('查询课程信息失败:', err);
                return res.status(500).json({ error: '成绩录入失败' });
            }

            if (courseResults.length === 0) {
                return res.status(404).json({ error: '未找到该课程' });
            }

            // 检查是否已存在该学生的该课程成绩
            const checkGradeQuery = 'SELECT * FROM grades WHERE student_id = ? AND course_id = ?';
            db.executeQuery(checkGradeQuery, [student_id, course_id], (err, gradeResults) => {
                if (err) {
                    console.error('查询成绩记录失败:', err);
                    return res.status(500).json({ error: '成绩录入失败' });
                }

                if (gradeResults.length > 0) {
                    return res.status(400).json({ error: '该学生的这门课程成绩已存在' });
                }

                // 插入成绩记录
                const insertQuery = 'INSERT INTO grades (student_id, course_id, score) VALUES (?, ?, ?)';
                db.executeQuery(insertQuery, [student_id, course_id, score], (err, result) => {
                    if (err) {
                        console.error('成绩录入失败:', err);
                        return res.status(500).json({ error: '成绩录入失败' });
                    }

                    res.json({
                        message: '成绩录入成功',
                        grade_id: result.insertId
                    });
                });
            });
        });
    });
};

//成绩异议
exports.updateGrade = (req, res) => {
    const { student_id, course_id, score } = req.body;

    // 检查参数是否完整
    if (!student_id || !course_id || !score) {
        return res.status(400).json({ error: '请提供完整的参数' });
    }

    // 检查学生是否存在
    const checkStudentQuery = 'SELECT * FROM students WHERE student_id = ?';
    db.executeQuery(checkStudentQuery, [student_id], (err, studentResults) => {
        if (err) {
            console.error('查询学生信息失败:', err);
            return res.status(500).json({ error: '成绩修改失败' });
        }

        if (studentResults.length === 0) {
            return res.status(404).json({ error: '未找到该学生' });
        }

        // 检查课程是否存在
        const checkCourseQuery = 'SELECT * FROM courses WHERE course_id = ?';
        db.executeQuery(checkCourseQuery, [course_id], (err, courseResults) => {
            if (err) {
                console.error('查询课程信息失败:', err);
                return res.status(500).json({ error: '成绩修改失败' });
            }

            if (courseResults.length === 0) {
                return res.status(404).json({ error: '未找到该课程' });
            }

            // 检查成绩记录是否存在
            const checkGradeQuery = 'SELECT * FROM grades WHERE student_id = ? AND course_id = ?';
            db.executeQuery(checkGradeQuery, [student_id, course_id], (err, gradeResults) => {
                if (err) {
                    console.error('查询成绩记录失败:', err);
                    return res.status(500).json({ error: '成绩修改失败' });
                }

                if (gradeResults.length === 0) {
                    return res.status(404).json({ error: '未找到该成绩记录' });
                }

                // 更新成绩
                const updateQuery = 'UPDATE grades SET score = ? WHERE student_id = ? AND course_id = ?';
                db.executeQuery(updateQuery, [score, student_id, course_id], (err, result) => {
                    if (err) {
                        console.error('成绩修改失败:', err);
                        return res.status(500).json({ error: '成绩修改失败' });
                    }

                    res.json({
                        message: '成绩修改成功',
                        affected_rows: result.affectedRows
                    });
                });
            });
        });
    });
};

// 获取所有学生
exports.getAllStudents = (req, res) => {
    console.log('Received request to get all students');
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const countQuery = 'SELECT COUNT(*) as total FROM students';
    
    // 获取性别统计
    const genderQuery = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN gender = '男' THEN 1 ELSE 0 END) as maleCount,
            SUM(CASE WHEN gender = '女' THEN 1 ELSE 0 END) as femaleCount
        FROM students
    `;

    // 获取分页数据
    const dataQuery = `
        SELECT * FROM students 
        ORDER BY student_id
        LIMIT ? OFFSET ?
    `;

    // 执行查询
    db.executeQuery(countQuery, [], (err, countResults) => {
        if (err) {
            console.error('Failed to fetch total count:', err);
            return res.status(500).json({ error: 'Failed to fetch students' });
        }

        db.executeQuery(genderQuery, [], (err, genderResults) => {
            if (err) {
                console.error('Failed to fetch gender statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch students' });
            }

            db.executeQuery(dataQuery, [parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error('Failed to fetch students:', err);
                    return res.status(500).json({ error: 'Failed to fetch students' });
                }

                res.status(200).json({
                    users: results,
                    total: countResults[0].total,
                    maleCount: genderResults[0].maleCount,
                    femaleCount: genderResults[0].femaleCount
                });
            });
        });
    });
};

// 获取所有课表
exports.getAllSchedules = (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const countQuery = 'SELECT COUNT(*) as total FROM schedules';
    
    // 获取统计信息
    const statsQuery = `
        SELECT 
            COUNT(DISTINCT class_name) as totalClasses,
            COUNT(DISTINCT course_id) as totalCourses
        FROM schedules
    `;

    // 获取分页数据
    const dataQuery = `
        SELECT * FROM schedules 
        ORDER BY weekday, start_time
        LIMIT ? OFFSET ?
    `;

    // 执行查询
    db.executeQuery(countQuery, [], (err, countResults) => {
        if (err) {
            console.error('Failed to fetch total count:', err);
            return res.status(500).json({ error: 'Failed to fetch schedules' });
        }

        db.executeQuery(statsQuery, [], (err, statsResults) => {
            if (err) {
                console.error('Failed to fetch statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch schedules' });
            }

            db.executeQuery(dataQuery, [parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error('Failed to fetch schedules:', err);
                    return res.status(500).json({ error: 'Failed to fetch schedules' });
                }

                res.status(200).json({
                    schedules: results,
                    total: countResults[0].total,
                    totalClasses: statsResults[0].totalClasses,
                    totalCourses: statsResults[0].totalCourses
                });
            });
        });
    });
};

// 添加课表
exports.addSchedule = (req, res) => {
    const {
        class_name,
        course_id,
        course_name,
        teacher,
        classroom,
        weekday,
        start_time,
        end_time,
        semester
    } = req.body;

    // 验证必填字段
    if (!class_name || !course_id || !course_name || !teacher || !classroom || !weekday || !start_time || !end_time || !semester) {
        return res.status(400).json({ error: '所有字段都是必需的' });
    }

    const query = `
        INSERT INTO schedules (
            class_name, course_id, course_name, teacher, classroom,
            weekday, start_time, end_time, semester
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        class_name, course_id, course_name, teacher, classroom,
        weekday, start_time, end_time, semester
    ];

    db.executeQuery(query, values, (err, result) => {
        if (err) {
            console.error('Failed to add schedule:', err);
            return res.status(500).json({ error: 'Failed to add schedule' });
        }

        res.status(201).json({
            message: 'Schedule added successfully',
            scheduleId: result.insertId
        });
    });
};

// 更新课表
exports.updateSchedule = (req, res) => {
    const scheduleId = req.params.id;
    const {
        class_name,
        course_id,
        course_name,
        teacher,
        classroom,
        weekday,
        start_time,
        end_time,
        semester
    } = req.body;

    if (!scheduleId) {
        return res.status(400).json({ error: 'Schedule ID is required' });
    }

    if (!class_name || !course_id || !course_name || !teacher || !classroom || !weekday || !start_time || !end_time || !semester) {
        return res.status(400).json({ error: '所有字段都是必需的' });
    }

    const query = `
        UPDATE schedules 
        SET class_name = ?, course_id = ?, course_name = ?, teacher = ?, classroom = ?,
            weekday = ?, start_time = ?, end_time = ?, semester = ?
        WHERE id = ?
    `;

    const values = [
        class_name, course_id, course_name, teacher, classroom,
        weekday, start_time, end_time, semester, scheduleId
    ];

    db.executeQuery(query, values, (err, result) => {
        if (err) {
            console.error('Failed to update schedule:', err);
            return res.status(500).json({ error: 'Failed to update schedule' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.status(200).json({
            message: 'Schedule updated successfully',
            scheduleId: scheduleId
        });
    });
};

// 删除课表
exports.deleteSchedule = (req, res) => {
    const scheduleId = req.params.id;

    if (!scheduleId) {
        return res.status(400).json({ error: 'Schedule ID is required' });
    }

    const query = 'DELETE FROM schedules WHERE id = ?';

    db.executeQuery(query, [scheduleId], (err, result) => {
        if (err) {
            console.error('Failed to delete schedule:', err);
            return res.status(500).json({ error: 'Failed to delete schedule' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.status(200).json({
            message: 'Schedule deleted successfully',
            scheduleId: scheduleId
        });
    });
};

// 获取所有课程
exports.getAllCourses = (req, res) => {
    console.log('Received request to get all courses');
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const countQuery = 'SELECT COUNT(*) as total FROM courses';
    
    // 获取学分统计
    const creditsQuery = `
        SELECT 
            COUNT(*) as total,
            SUM(credits) as totalCredits,
            AVG(credits) as averageCredits
        FROM courses
    `;

    // 获取分页数据
    const dataQuery = `
        SELECT * FROM courses 
        ORDER BY course_id
        LIMIT ? OFFSET ?
    `;

    // 执行查询
    db.executeQuery(countQuery, [], (err, countResults) => {
        if (err) {
            console.error('Failed to fetch total count:', err);
            return res.status(500).json({ error: 'Failed to fetch courses' });
        }

        db.executeQuery(creditsQuery, [], (err, creditsResults) => {
            if (err) {
                console.error('Failed to fetch credits statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch courses' });
            }

            db.executeQuery(dataQuery, [parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error('Failed to fetch courses:', err);
                    return res.status(500).json({ error: 'Failed to fetch courses' });
                }

                res.status(200).json({
                    courses: results,
                    total: countResults[0].total,
                    totalCredits: creditsResults[0].totalCredits,
                    averageCredits: creditsResults[0].averageCredits
                });
            });
        });
    });
};

// 获取所有成绩
exports.getAllGrades = (req, res) => {
    console.log('Received request to get all grades');
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const countQuery = 'SELECT COUNT(*) as total FROM grades';
    
    // 获取统计信息
    const statsQuery = `
        SELECT 
            COUNT(*) as total,
            AVG(score) as averageScore,
            (COUNT(CASE WHEN score >= 60 THEN 1 END) * 100.0 / COUNT(*)) as passRate
        FROM grades
    `;

    // 获取分页数据
    const dataQuery = `
        SELECT g.*, s.student_name, c.course_name
        FROM grades g
        LEFT JOIN students s ON g.student_id = s.student_id
        LEFT JOIN courses c ON g.course_id = c.course_id
        ORDER BY g.grade_time DESC
        LIMIT ? OFFSET ?
    `;

    // 执行查询
    db.executeQuery(countQuery, [], (err, countResults) => {
        if (err) {
            console.error('Failed to fetch total count:', err);
            return res.status(500).json({ error: 'Failed to fetch grades' });
        }

        db.executeQuery(statsQuery, [], (err, statsResults) => {
            if (err) {
                console.error('Failed to fetch statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch grades' });
            }

            db.executeQuery(dataQuery, [parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error('Failed to fetch grades:', err);
                    return res.status(500).json({ error: 'Failed to fetch grades' });
                }

                res.status(200).json({
                    grades: results,
                    total: countResults[0].total,
                    averageScore: statsResults[0].averageScore || 0,
                    passRate: statsResults[0].passRate || 0
                });
            });
        });
    });
};

// 删除成绩
exports.deleteGrade = (req, res) => {
    const gradeId = req.params.id;

    if (!gradeId) {
        return res.status(400).json({ error: 'Grade ID is required' });
    }

    const query = 'DELETE FROM grades WHERE grade_id = ?';

    db.executeQuery(query, [gradeId], (err, result) => {
        if (err) {
            console.error('Failed to delete grade:', err);
            return res.status(500).json({ error: 'Failed to delete grade' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Grade not found' });
        }

        res.status(200).json({
            message: 'Grade deleted successfully',
            gradeId: gradeId
        });
    });
};

// 获取指定学生的证书
exports.getStudentCertificates = (req, res) => {
    const studentId = req.params.id;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    const query = 'SELECT * FROM certificates WHERE student_id = ? ORDER BY uploaded_at DESC';

    db.executeQuery(query, [studentId], (err, results) => {
        if (err) {
            console.error('Failed to fetch student certificates:', err);
            return res.status(500).json({ error: 'Failed to fetch certificates' });
        }

        res.status(200).json({
            message: 'Certificates retrieved successfully',
            certificates: results
        });
    });
};

// 获取指定学生的成绩
exports.getStudentGrades = (req, res) => {
    const studentId = req.params.id;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    const query = `
        SELECT g.*, c.course_name, c.credits 
        FROM grades g
        JOIN courses c ON g.course_id = c.course_id
        WHERE g.student_id = ?
        ORDER BY g.grade_time DESC
    `;

    db.executeQuery(query, [studentId], (err, results) => {
        if (err) {
            console.error('Failed to fetch student grades:', err);
            return res.status(500).json({ error: 'Failed to fetch grades' });
        }

        res.status(200).json({
            message: 'Grades retrieved successfully',
            grades: results
        });
    });
};

// 获取指定学生的课表
exports.getStudentSchedules = (req, res) => {
    const studentId = req.params.id;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    // 首先获取学生所在班级
    const getClassQuery = 'SELECT class FROM students WHERE student_id = ?';
    db.executeQuery(getClassQuery, [studentId], (err, studentResults) => {
        if (err) {
            console.error('Failed to get student class:', err);
            return res.status(500).json({ error: 'Failed to fetch schedules' });
        }

        if (studentResults.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const className = studentResults[0].class;

        // 获取该班级的课表，并关联课程表获取课程介绍
        const query = `
            SELECT s.*, c.description 
            FROM schedules s
            LEFT JOIN courses c ON s.course_id = c.course_id
            WHERE s.class_name = ?
            ORDER BY s.weekday, s.start_time
        `;

        db.executeQuery(query, [className], (err, results) => {
            if (err) {
                console.error('Failed to fetch schedules:', err);
                return res.status(500).json({ error: 'Failed to fetch schedules' });
            }

            res.status(200).json({
                message: 'Schedules retrieved successfully',
                schedules: results
            });
        });
    });
};

// 获取学生信息
exports.getStudent = (req, res) => {
    const studentId = req.params.id;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    const query = 'SELECT * FROM students WHERE student_id = ?';

    db.executeQuery(query, [studentId], (err, results) => {
        if (err) {
            console.error('Failed to get student:', err);
            return res.status(500).json({ error: 'Failed to get student' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.status(200).json(results[0]);
    });
};

// 提交学生信息更新请求
exports.submitUpdateRequest = (req, res) => {
    const { student_id, student_name, date_of_birth, id_card, phone_number, address } = req.body;

    // 验证必要字段
    if (!student_id || !student_name || !date_of_birth || !id_card || !phone_number || !address) {
        return res.status(400).json({ error: '所有字段都是必需的' });
    }

    const query = `
        INSERT INTO student_update_requests (
            student_id, student_name, date_of_birth, id_card, 
            phone_number, address, status, request_time
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    const values = [student_id, student_name, date_of_birth, id_card, phone_number, address];

    db.executeQuery(query, values, (err, result) => {
        if (err) {
            console.error('Failed to submit update request:', err);
            return res.status(500).json({ error: '提交更新请求失败' });
        }

        res.status(201).json({
            message: '信息更新请求提交成功',
            request_id: result.insertId
        });
    });
};

// 获取待审核的修改请求
exports.getPendingUpdateRequest = (req, res) => {
    const studentId = req.params.id;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    const query = `
        SELECT * FROM student_update_requests 
        WHERE student_id = ? AND status = 'pending'
        ORDER BY request_time DESC
        LIMIT 1
    `;

    db.executeQuery(query, [studentId], (err, results) => {
        if (err) {
            console.error('Failed to get pending request:', err);
            return res.status(500).json({ error: '获取待审核请求失败' });
        }

        if (results.length === 0) {
            return res.status(200).json(null);
        }

        res.status(200).json(results[0]);
    });
};

// 获取所有学生信息更新请求
exports.getAllUpdateRequests = (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const countQuery = 'SELECT COUNT(*) as total FROM student_update_requests';
    
    // 获取统计信息
    const statsQuery = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCount,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedCount,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedCount
        FROM student_update_requests
    `;

    // 获取分页数据
    const dataQuery = `
        SELECT r.*, s.student_name
        FROM student_update_requests r
        LEFT JOIN students s ON r.student_id = s.student_id
        ORDER BY r.request_time DESC
        LIMIT ? OFFSET ?
    `;

    // 执行查询
    db.executeQuery(countQuery, [], (err, countResults) => {
        if (err) {
            console.error('Failed to fetch total count:', err);
            return res.status(500).json({ error: 'Failed to fetch update requests' });
        }

        db.executeQuery(statsQuery, [], (err, statsResults) => {
            if (err) {
                console.error('Failed to fetch statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch update requests' });
            }

            db.executeQuery(dataQuery, [parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error('Failed to fetch update requests:', err);
                    return res.status(500).json({ error: 'Failed to fetch update requests' });
                }

                res.status(200).json({
                    requests: results,
                    total: countResults[0].total,
                    pendingCount: statsResults[0].pendingCount || 0,
                    approvedCount: statsResults[0].approvedCount || 0,
                    rejectedCount: statsResults[0].rejectedCount || 0
                });
            });
        });
    });
};

// 审核更新请求
exports.reviewUpdateRequest = (req, res) => {
    const { request_id, status, review_comment } = req.body;

    if (!request_id || !status || !review_comment) {
        return res.status(400).json({ error: '请求ID、状态和审核意见都是必需的' });
    }

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: '无效的状态值' });
    }

    // 首先获取请求的详细信息
    const getRequestQuery = 'SELECT * FROM student_update_requests WHERE id = ?';
    
    db.executeQuery(getRequestQuery, [request_id], (err, requestResults) => {
        if (err) {
            console.error('Failed to get request details:', err);
            return res.status(500).json({ error: '获取请求详情失败' });
        }

        if (requestResults.length === 0) {
            return res.status(404).json({ error: '未找到该更新请求' });
        }

        const request = requestResults[0];

        // 更新请求状态
        const updateRequestQuery = `
            UPDATE student_update_requests 
            SET status = ?, 
                review_time = NOW(),
                review_comment = ?
            WHERE id = ?
        `;

        db.executeQuery(updateRequestQuery, [status, review_comment, request_id], (err, result) => {
            if (err) {
                console.error('Failed to review update request:', err);
                return res.status(500).json({ error: '审核更新请求失败' });
            }

            // 如果审核通过，更新学生信息
            if (status === 'approved') {
                const updateStudentQuery = `
                    UPDATE students 
                    SET student_name = ?, 
                        date_of_birth = ?, 
                        id_card = ?, 
                        phone_number = ?, 
                        address = ?
                    WHERE student_id = ?
                `;

                db.executeQuery(updateStudentQuery, [
                    request.student_name,
                    request.date_of_birth,
                    request.id_card,
                    request.phone_number,
                    request.address,
                    request.student_id
                ], (err, result) => {
                    if (err) {
                        console.error('Failed to update student info:', err);
                        return res.status(500).json({ error: '更新学生信息失败' });
                    }
                });
            }

            res.status(200).json({
                message: '审核完成',
                request_id: request_id
            });
        });
    });
};

// 获取证书统计与分析
exports.getCertificateStatistics = (req, res) => {
    const studentId = req.params.id;

    if (!studentId) {
        return res.status(400).json({ error: '学生ID是必需的' });
    }

    // 获取学生信息
    const getStudentQuery = 'SELECT * FROM students WHERE student_id = ?';
    
    db.executeQuery(getStudentQuery, [studentId], (err, studentResults) => {
        if (err) {
            console.error('获取学生信息失败:', err);
            return res.status(500).json({ error: '获取统计信息失败' });
        }

        if (studentResults.length === 0) {
            return res.status(404).json({ error: '未找到该学生' });
        }

        const student = studentResults[0];

        // 获取学生所有证书
        const getCertificatesQuery = 'SELECT * FROM certificates WHERE student_id = ? ORDER BY uploaded_at DESC';
        
        db.executeQuery(getCertificatesQuery, [studentId], (err, certificateResults) => {
            if (err) {
                console.error('获取学生证书失败:', err);
                return res.status(500).json({ error: '获取统计信息失败' });
            }

            // 生成统计信息
            const statistics = generateStatistics(student, certificateResults);
            
            res.status(200).json({
                message: '获取统计信息成功',
                statistics: statistics
            });
        });
    });
};

// 生成统计信息
function generateStatistics(student, certificates) {
    // 基础统计
    const totalCertificates = certificates.length;
    
    // 按证书类型统计
    const certificateTypes = {};
    certificates.forEach(cert => {
        const type = getCertificateType(cert.certificate_name);
        if (!certificateTypes[type]) {
            certificateTypes[type] = 0;
        }
        certificateTypes[type]++;
    });

    // 按时间统计
    const certificatesByYear = {};
    certificates.forEach(cert => {
        const year = new Date(cert.uploaded_at).getFullYear();
        if (!certificatesByYear[year]) {
            certificatesByYear[year] = 0;
        }
        certificatesByYear[year]++;
    });

    // 按颁发机构统计
    const certificatesByAuthority = {};
    certificates.forEach(cert => {
        const authority = cert.certificate_authority || '未知机构';
        if (!certificatesByAuthority[authority]) {
            certificatesByAuthority[authority] = 0;
        }
        certificatesByAuthority[authority]++;
    });

    // 生成分析报告
    const analysis = generateAnalysisReport(student, certificates, certificateTypes);

    return {
        totalCertificates,
        certificateTypes,
        certificatesByYear,
        certificatesByAuthority,
        analysis
    };
}

// 获取证书类型
function getCertificateType(certificateName) {
    const name = certificateName.toLowerCase();
    if (name.includes('英语')) return '语言类';
    if (name.includes('计算机')) return '计算机类';
    if (name.includes('软件') || name.includes('网络')) return '专业认证';
    return '其他';
}

// 生成分析报告
function generateAnalysisReport(student, certificates, certificateTypes) {
    const reports = [];
    
    // 基础分析
    reports.push({
        type: '基础分析',
        content: `您目前共获得 ${certificates.length} 个证书，在计算机科学专业学生中处于${getLevelDescription(certificates.length)}水平。`
    });

    // 证书类型分析
    const typeAnalysis = [];
    Object.entries(certificateTypes).forEach(([type, count]) => {
        typeAnalysis.push({
            type,
            count,
            suggestion: getTypeSuggestion(type, count)
        });
    });
    reports.push({
        type: '证书类型分析',
        content: typeAnalysis
    });

    // 专业发展建议
    const majorSuggestions = getMajorSuggestions(student.class, certificateTypes);
    reports.push({
        type: '专业发展建议',
        content: majorSuggestions
    });

    return reports;
}

// 获取水平描述
function getLevelDescription(count) {
    if (count >= 5) return '优秀';
    if (count >= 3) return '良好';
    if (count >= 1) return '一般';
    return '待提升';
}

// 获取类型建议
function getTypeSuggestion(type, count) {
    switch (type) {
        case '语言类':
            return count >= 2 ? '您的语言类证书较为丰富，建议继续提升专业能力。' : '建议考取更多语言类证书，提升语言能力。';
        case '计算机类':
            return count >= 1 ? '您已具备基础计算机能力，建议向专业方向发展。' : '建议考取计算机类基础证书。';
        case '专业认证':
            return count >= 1 ? '您已开始专业认证，建议继续深入发展。' : '建议考取与专业相关的认证证书。';
        default:
            return '建议根据职业规划考取相关证书。';
    }
}

// 获取专业发展建议
function getMajorSuggestions(major, certificateTypes) {
    const suggestions = [];
    
    if (major.includes('计算机')) {
        if (!certificateTypes['计算机类']) {
            suggestions.push('建议考取计算机二级证书，夯实基础能力。');
        }
        if (!certificateTypes['专业认证']) {
            suggestions.push('建议考取软件设计师或网络工程师等专业认证，提升就业竞争力。');
        }
        if (!certificateTypes['语言类']) {
            suggestions.push('建议考取英语四级证书，提升语言能力。');
        }
    }

    return suggestions.length > 0 ? suggestions : ['您的证书结构较为合理，建议继续按照职业规划发展。'];
}

// 获取证书推荐
exports.getCertificateRecommendations = (req, res) => {
    const studentId = req.params.id;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    // 首先获取学生信息
    const getStudentQuery = 'SELECT * FROM students WHERE student_id = ?';
    
    db.executeQuery(getStudentQuery, [studentId], (err, studentResults) => {
        if (err) {
            console.error('Failed to get student information:', err);
            return res.status(500).json({ error: 'Failed to get student information' });
        }

        if (studentResults.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = studentResults[0];

        // 获取学生已获得的证书
        const getCertificatesQuery = 'SELECT * FROM certificates WHERE student_id = ?';
        
        db.executeQuery(getCertificatesQuery, [studentId], (err, certificateResults) => {
            if (err) {
                console.error('Failed to get student certificates:', err);
                return res.status(500).json({ error: 'Failed to get student certificates' });
            }

            // 生成推荐
            const recommendations = generateRecommendations(student, certificateResults);
            
            res.status(200).json({
                message: 'Recommendations retrieved successfully',
                recommendations: recommendations
            });
        });
    });
};

// 生成证书推荐
function generateRecommendations(student, existingCertificates) {
    const recommendations = [];
    const existingCertificateNames = new Set(existingCertificates.map(c => c.certificate_name));

    // 通用证书推荐
    const commonCertificates = [
        { name: '大学英语四级证书', priority: 1, reason: '基础语言能力认证' },
        { name: '大学英语六级证书', priority: 2, reason: '高级语言能力认证' },
        { name: '计算机二级证书', priority: 1, reason: '基础计算机能力认证' },
        { name: '普通话水平测试证书', priority: 1, reason: '基础语言表达能力认证' }
    ];

    // 专业相关证书推荐
    const majorCertificates = {
        '计算机科学与技术': [
            { name: '软件设计师', priority: 3, reason: '软件开发专业认证' },
            { name: '网络工程师', priority: 3, reason: '网络技术专业认证' },
            { name: '数据库系统工程师', priority: 3, reason: '数据库管理专业认证' }
        ],
        '金融学': [
            { name: '证券从业资格证', priority: 3, reason: '金融行业基础认证' },
            { name: '基金从业资格证', priority: 3, reason: '基金行业基础认证' },
            { name: '银行从业资格证', priority: 3, reason: '银行业基础认证' }
        ],
        '会计学': [
            { name: '初级会计师', priority: 3, reason: '会计行业基础认证' },
            { name: '注册会计师', priority: 4, reason: '会计行业高级认证' },
            { name: '税务师', priority: 3, reason: '税务专业认证' }
        ]
    };

    // 添加通用证书推荐
    commonCertificates.forEach(cert => {
        if (!existingCertificateNames.has(cert.name)) {
            recommendations.push(cert);
        }
    });

    // 添加专业相关证书推荐
    if (majorCertificates[student.major]) {
        majorCertificates[student.major].forEach(cert => {
            if (!existingCertificateNames.has(cert.name)) {
                recommendations.push(cert);
            }
        });
    }

    // 按优先级排序
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations;
}

/////////////////教师登录
exports.teacherLogin = (req, res) => {
    const { account, password } = req.body;

    if (!account || !password) {
        return res.status(400).json({ error: '工号和密码不能为空' });
    }

    // 修改 SQL 查询以匹配数据库表结构
    const query = `
        SELECT id, teacher_id, name, email 
        FROM teachers 
        WHERE teacher_id = ? AND password = ?
    `;

    db.executeQuery(query, [account, password], (err, results) => {
        if (err) {
            console.error('教师登录失败:', err);
            return res.status(500).json({ error: '登录失败' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: '工号或密码错误' });
        }

        const teacher = results[0];
        res.json({
            message: 'Login successful',
            teacher_id: teacher.teacher_id,
            name: teacher.name,
            email: teacher.email
        });
    });
};
// 获取教师课表
exports.getTeacherCourses = (req, res) => {
    const teacherId = req.params.teacherId;
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
        JOIN teacher_course tc ON c.course_id = tc.course_id
        WHERE tc.teacher_id = ?
    `;

    // 获取总学分
    const creditsQuery = `
        SELECT SUM(c.credits) as totalCredits
        FROM courses c
        JOIN teacher_course tc ON c.course_id = tc.course_id
        WHERE tc.teacher_id = ?
    `;

    // 获取分页数据
    const dataQuery = `
        SELECT 
            c.course_id, 
            c.course_name, 
            c.credits, 
            c.class_name
        FROM courses c
        JOIN teacher_course tc ON c.course_id = tc.course_id
        WHERE tc.teacher_id = ?
        ORDER BY c.course_id
        LIMIT ? OFFSET ?
    `;
    
    // 执行查询
    db.executeQuery(countQuery, [teacherId], (err, countResults) => {
        if (err) {
            console.error('获取总记录数失败:', err);
            return res.status(500).json({ error: '获取课程列表失败' });
        }

        db.executeQuery(creditsQuery, [teacherId], (err, creditsResults) => {
            if (err) {
                console.error('获取总学分失败:', err);
                return res.status(500).json({ error: '获取课程列表失败' });
            }

            db.executeQuery(dataQuery, [teacherId, parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error('获取课程数据失败:', err);
                    return res.status(500).json({ error: '获取课程列表失败' });
                }

                res.json({
                    courses: results,
                    total: countResults[0].total,
                    totalCredits: creditsResults[0].totalCredits || 0
                });
            });
        });
    });
};

// 获取教师所教课程的成绩
exports.getTeacherGrades = (req, res) => {
    const teacherId = req.params.teacherId;
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取总记录数
    const countQuery = `
        SELECT COUNT(*) as total
        FROM grades g
        JOIN teacher_course tc ON g.course_id = tc.course_id
        WHERE tc.teacher_id = ?
    `;

    // 获取平均成绩
    const averageQuery = `
        SELECT AVG(g.score) as averageScore
        FROM grades g
        JOIN teacher_course tc ON g.course_id = tc.course_id
        WHERE tc.teacher_id = ?
    `;

    // 获取分页数据
    const dataQuery = `
        SELECT g.* 
        FROM grades g
        JOIN teacher_course tc ON g.course_id = tc.course_id
        WHERE tc.teacher_id = ?
        ORDER BY g.grade_time DESC
        LIMIT ? OFFSET ?
    `;
    
    // 执行查询
    db.executeQuery(countQuery, [teacherId], (err, countResults) => {
        if (err) {
            console.error('获取总记录数失败:', err);
            return res.status(500).json({ error: '获取成绩列表失败' });
        }

        db.executeQuery(averageQuery, [teacherId], (err, averageResults) => {
            if (err) {
                console.error('获取平均成绩失败:', err);
                return res.status(500).json({ error: '获取成绩列表失败' });
            }

            db.executeQuery(dataQuery, [teacherId, parseInt(pageSize), offset], (err, results) => {
                if (err) {
                    console.error('获取成绩数据失败:', err);
                    return res.status(500).json({ error: '获取成绩列表失败' });
                }

                res.json({
                    grades: results,
                    total: countResults[0].total,
                    averageScore: averageResults[0].averageScore || 0
                });
            });
        });
    });
};

// 教师添加成绩
exports.addTeacherGrade = (req, res) => {
    const { teacher_id, student_id, course_id, score } = req.body;

    // 首先验证是否是该教师的课程
    const verifyQuery = 'SELECT * FROM teacher_course WHERE teacher_id = ? AND course_id = ?';
    
    db.executeQuery(verifyQuery, [teacher_id, course_id], (err, results) => {
        if (err) {
            console.error('验证教师课程失败:', err);
            return res.status(500).json({ error: '验证失败' });
        }

        if (results.length === 0) {
            return res.status(403).json({ error: '您没有权限为该课程录入成绩' });
        }

        // 验证通过后添加成绩
        const insertQuery = 'INSERT INTO grades (student_id, course_id, score) VALUES (?, ?, ?)';
        
        db.executeQuery(insertQuery, [student_id, course_id, score], (err, result) => {
            if (err) {
                console.error('添加成绩失败:', err);
                return res.status(500).json({ error: '添加成绩失败' });
            }
            res.json({ message: '成绩添加成功', grade_id: result.insertId });
        });
    });
};
// 获取教师个人信息
exports.getTeacherProfile = (req, res) => {
    const teacherId = req.params.teacherId;
    console.log('获取教师信息，ID:', teacherId);

    if (!teacherId) {
        return res.status(400).json({ error: '教师ID不能为空' });
    }

    const query = `
        SELECT teacher_id, name, email, created_at, updated_at
        FROM teachers
        WHERE teacher_id = ?
    `;
    
    db.executeQuery(query, [teacherId], (err, results) => {
        if (err) {
            console.error('获取教师信息失败:', err);
            return res.status(500).json({ error: '获取个人信息失败' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: '未找到教师信息' });
        }

        const teacherInfo = results[0];
        res.json(teacherInfo);
    });
};
// 教师修改密码
exports.updateTeacherPassword = (req, res) => {
    const { teacher_id, old_password, new_password } = req.body;

    if (!teacher_id || !old_password || !new_password) {
        return res.status(400).json({ error: '所有字段都是必需的' });
    }

    // 先验证原密码
    const verifyQuery = 'SELECT * FROM teachers WHERE teacher_id = ? AND password = ?';
    
    db.executeQuery(verifyQuery, [teacher_id, old_password], (err, results) => {
        if (err) {
            console.error('验证密码失败:', err);
            return res.status(500).json({ error: '密码修改失败' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: '原密码错误' });
        }

        // 更新新密码
        const updateQuery = 'UPDATE teachers SET password = ? WHERE teacher_id = ?';
        
        db.executeQuery(updateQuery, [new_password, teacher_id], (err, result) => {
            if (err) {
                console.error('更新密码失败:', err);
                return res.status(500).json({ error: '密码修改失败' });
            }

            res.json({ message: '密码修改成功' });
        });
    });
};

// 获取所有证书类型
exports.getAllCertificateTypes = (req, res) => {
    const query = 'SELECT * FROM certificate_types ORDER BY created_at DESC';
    db.executeQuery(query, [], (err, results) => {
        if (err) {
            console.error('获取证书类型失败:', err);
            return res.status(500).json({ error: '获取证书类型失败' });
        }
        res.json(results);
    });
};

// 添加证书类型
exports.addCertificateType = (req, res) => {
    const { type_name, description } = req.body;
    const query = 'INSERT INTO certificate_types (type_name, description) VALUES (?, ?)';
    db.executeQuery(query, [type_name, description], (err, result) => {
        if (err) {
            console.error('添加证书类型失败:', err);
            return res.status(500).json({ error: '添加证书类型失败' });
        }
        res.status(201).json({ id: result.insertId });
    });
};
// 更新证书类型（针对证书类型表的更新）
exports.updateCertificateType = (req, res) => {
    const { id } = req.params;
    const { type_name, description } = req.body;
    const query = 'UPDATE certificate_types SET type_name = ?, description = ? WHERE id = ?';
    db.executeQuery(query, [type_name, description, id], (err, result) => {
        if (err) {
            console.error('更新证书类型失败:', err);
            return res.status(500).json({ error: '更新证书类型失败' });
        }
        res.json({ message: '更新成功' });
    });
};
// 更新证书的类型分配（针对单个证书的类型更新）
exports.updateCertificateTypeAssignment = (req, res) => {
    const { certificateId, typeId } = req.params;
    
    const query = `
        UPDATE certificates 
        SET type_id = ? 
        WHERE id = ?
    `;
    
    db.executeQuery(query, [typeId, certificateId], (err, result) => {
        if (err) {
            console.error('更新证书类型失败:', err);
            return res.status(500).json({ error: '更新证书类型失败' });
        }
        res.json({ message: '更新成功' });
    });
};

// 删除证书类型
exports.deleteCertificateType = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM certificate_types WHERE id = ?';
    db.executeQuery(query, [id], (err, result) => {
        if (err) {
            console.error('删除证书类型失败:', err);
            return res.status(500).json({ error: '删除证书类型失败' });
        }
        res.json({ message: '删除成功' });
    });
};

// 获取指定类型的证书
exports.getCertificatesByType = (req, res) => {
    const { typeId } = req.params;
    const query = 'SELECT * FROM certificates WHERE type_id = ? ORDER BY uploaded_at DESC';
    db.executeQuery(query, [typeId], (err, results) => {
        if (err) {
            console.error('获取证书列表失败:', err);
            return res.status(500).json({ error: '获取证书列表失败' });
        }
        res.json(results);
    });
};



// 添加新的控制器方法
exports.updateCertificateTypeAssignment = (req, res) => {
    const { certificateId } = req.params;
    const { type_id } = req.body;
    
    const query = `
        UPDATE certificates 
        SET type_id = ? 
        WHERE id = ?
    `;
    
    db.executeQuery(query, [type_id, certificateId], (err, result) => {
        if (err) {
            console.error('更新证书类型失败:', err);
            return res.status(500).json({ error: '更新证书类型失败' });
        }
        res.json({ message: '更新成功' });
    });
};

// 获取所有校历事件
exports.getAllCalendarEvents = (req, res) => {
    const query = 'SELECT * FROM academic_calendar ORDER BY start_date';
    
    db.executeQuery(query, [], (err, results) => {
        if (err) {
            console.error('获取校历失败:', err);
            return res.status(500).json({ error: '获取校历失败' });
        }
        res.json(results);
    });
};

// 添加校历事件
exports.addCalendarEvent = (req, res) => {
    const { event_name, start_date, end_date, event_type, description } = req.body;

    if (!event_name || !start_date || !end_date || !event_type) {
        return res.status(400).json({ error: '缺少必要字段' });
    }

    const query = `
        INSERT INTO academic_calendar 
        (event_name, start_date, end_date, event_type, description)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.executeQuery(query, [event_name, start_date, end_date, event_type, description], (err, result) => {
        if (err) {
            console.error('添加校历事件失败:', err);
            return res.status(500).json({ error: '添加校历事件失败' });
        }
        res.json({ message: '添加成功', id: result.insertId });
    });
};
// 更新校历事件
exports.updateCalendarEvent = (req, res) => {
    const { id } = req.params;
    const { event_name, start_date, end_date, event_type, description } = req.body;

    if (!event_name || !start_date || !end_date || !event_type) {
        return res.status(400).json({ error: '缺少必要字段' });
    }

    const query = `
        UPDATE academic_calendar 
        SET event_name = ?, 
            start_date = ?, 
            end_date = ?, 
            event_type = ?, 
            description = ?
        WHERE id = ?
    `;

    db.executeQuery(query, [event_name, start_date, end_date, event_type, description, id], (err, result) => {
        if (err) {
            console.error('更新校历事件失败:', err);
            return res.status(500).json({ error: '更新校历事件失败' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '未找到该校历事件' });
        }

        res.json({ message: '更新成功' });
    });
};
// 删除校历事件
exports.deleteCalendarEvent = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM academic_calendar WHERE id = ?';

    db.executeQuery(query, [id], (err, result) => {
        if (err) {
            console.error('删除校历事件失败:', err);
            return res.status(500).json({ error: '删除校历事件失败' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '未找到该校历事件' });
        }

        res.json({ message: '删除成功' });
    });
};