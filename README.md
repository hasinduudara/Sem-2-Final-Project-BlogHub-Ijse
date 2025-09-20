# 📖 Blog Article Platform

## 📝 Project Description
This is my **Semester 2 Final Project** – a full-stack **Blog Article Platform** developed to enable **users, publishers, and admins** to interact with articles in different ways.  

- **Users** can read, like, and comment on articles, and update their profiles.  
- **Publishers** can create, publish, schedule, edit, and delete their own articles. They also have access to a special **Article Generation Tool** with both free and paid versions.  
- **Admins** can delete any article, manage users and publishers, add or remove other admins, and view all payment details.  

The platform integrates **third-party APIs** such as **ImgBB** for image hosting, **Gemini** for AI-powered article generation, and **PayHere** for handling payments.  

---

## 📸 Screenshots  

### 🏠 Welcome Page 
<img width="1901" height="897" alt="image" src="https://github.com/user-attachments/assets/72221ec0-2b58-42ab-8174-6eca887f948d" />

### 📑 User Dashboard 
<img width="1898" height="898" alt="image" src="https://github.com/user-attachments/assets/252b6f12-855e-4696-b154-82729a5e3baf" />

### 📝 Publisher Panel
<img width="1900" height="898" alt="image" src="https://github.com/user-attachments/assets/b5b74c6e-3fb4-4242-bba4-76c59f9e7e41" />

### 💵 Payment
<img width="1878" height="896" alt="image" src="https://github.com/user-attachments/assets/bd0c72a9-049e-447a-bd5b-d4286e120fc5" />

### 🔧 Admin Panel
<img width="1918" height="896" alt="image" src="https://github.com/user-attachments/assets/65931633-9c46-482d-a834-5d0fcab8f531" />

---

## ⚙️ Setup Instructions  

Follow these steps to run the project locally.  

### 🔹 Full Project  

1. Clone the repository:  
```bash
   git clone [https://github.com/your-username/blog-article-platform.git

```
2. Configure the database in application.properties:
```bash
  spring.datasource.url=jdbc:mysql://localhost:3306/blog_platform
  spring.datasource.username=your_username
  spring.datasource.password=your_password
  spring.jpa.hibernate.ddl-auto=update

```
3. Run the backend application:
```bash
mvn spring-boot:run

```
4. Run the frontend:
Open the index.html file (Use Live Server)

# Additional Configurations -

- ImgBB API Key → Add your API key in the image upload function.
- Gemini API Key → Configure your AI article generation tool.
- PayHere → Add your merchant ID and secret in the payment integration code.

# 🎥 Demo Video
👉 Watch the Demo - https://youtu.be/Fs9bzs-PF00

# 🛠️ Tech Stack

- Backend: Java 21, Spring Boot, Hibernate, JWT, Maven
- Database: MySQL
- Frontend: HTML, CSS, JavaScript, Bootstrap
- Third-party APIs: ImgBB, Gemini
- Payment Gateway: PayHere

# 📬 Contact

If you would like to get in touch with me:

- 📧 Email: hasiduudara@gmail.com
- 💼 LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/hasindu-udara/)
- 🌐 GitHub: [Your GitHub Profile](https://github.com/hasinduudara/)
- Website: https://hasinduudarainfo.web.app/

# 🙏 Thank You

Thank you for taking the time to explore my project!
Your feedback and suggestions are always welcome. 🚀
