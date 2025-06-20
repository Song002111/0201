-- 检查是否存在description列，如果不存在则添加
SET @dbname = DATABASE();
SET @tablename = "courses";
SET @columnname = "description";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE 
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE courses ADD COLUMN description TEXT"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 更新课程介绍数据
UPDATE `courses` SET `description` = '本课程主要讲授高等数学的基本概念、理论和方法，包括微积分、级数、多元函数等内容。通过本课程的学习，学生将掌握高等数学的基本理论和应用方法，为后续专业课程的学习打下坚实的数学基础。' WHERE `course_id` = 'C101';

UPDATE `courses` SET `description` = '本课程介绍计算机科学的基础知识，包括计算机硬件、软件、操作系统、网络等基本概念。通过本课程的学习，学生将了解计算机系统的基本组成和工作原理。' WHERE `course_id` = 'C102';

UPDATE `courses` SET `description` = '本课程系统地介绍数据结构的基本概念、基本操作和典型应用。主要内容包括线性表、栈、队列、树、图等基本数据结构，以及查找、排序等基本算法。' WHERE `course_id` = 'C103';

UPDATE `courses` SET `description` = '本课程介绍人工智能的基本概念、发展历史、主要研究领域和应用。通过本课程的学习，学生将了解人工智能的基本理论和方法，以及人工智能在各个领域的应用。' WHERE `course_id` = 'C104';

UPDATE `courses` SET `description` = '本课程介绍操作系统的基本概念、原理和实现技术。主要内容包括进程管理、内存管理、文件系统、设备管理等。通过本课程的学习，学生将深入理解操作系统的工作原理。' WHERE `course_id` = 'C105';

UPDATE `courses` SET `description` = '本课程系统地介绍Java语言的基本语法、面向对象编程、集合框架、多线程、网络编程等内容。通过本课程的学习，学生将掌握Java编程的基本技能。' WHERE `course_id` = 'C106';

UPDATE `courses` SET `description` = '本课程介绍计算机网络的基本概念、协议和实现技术。主要内容包括网络体系结构、TCP/IP协议、局域网、广域网、网络安全等。' WHERE `course_id` = 'CS104';

UPDATE `courses` SET `description` = '本课程介绍数据库系统的基本概念、原理和应用。主要内容包括数据库设计、SQL语言、数据库管理系统、数据库安全等。' WHERE `course_id` = 'CS105';

UPDATE `courses` SET `description` = '本课程介绍软件工程的基本概念、方法和工具。主要内容包括软件生命周期、需求分析、系统设计、编码、测试、维护等。' WHERE `course_id` = 'CS106';

UPDATE `courses` SET `description` = '本课程介绍人工智能的基础理论和应用。主要内容包括知识表示、搜索策略、机器学习、专家系统等。' WHERE `course_id` = 'CS107';

UPDATE `courses` SET `description` = '本课程介绍机器学习的基本概念、算法和应用。主要内容包括监督学习、无监督学习、强化学习等机器学习方法。' WHERE `course_id` = 'CS108';

UPDATE `courses` SET `description` = '本课程介绍深度学习的基本理论和应用。主要内容包括神经网络、卷积神经网络、循环神经网络等深度学习模型。' WHERE `course_id` = 'CS109';

UPDATE `courses` SET `description` = '本课程介绍区块链技术的基本概念、原理和应用。主要内容包括区块链架构、共识机制、智能合约、加密货币等。' WHERE `course_id` = 'CS110'; 