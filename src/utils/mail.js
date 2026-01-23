import Mailgen from "mailgen";
import nodemailer from "nodemailer"

//creating a method for sending an email, rn its not sending the email it is just preparing the email, later on we will write that method as well

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme : "default",
        product :{
            name : "Task Manager",
            link : "https://taskmanagelink.com" 
        }
    })


    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)

    const emailHTML = mailGenerator.generate(options.mailgenContent)
    
    //now we send the mail (create transport)

    const transporter = nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user : process.env.MAILTRAP_SMTP_USER,
            pass : process.env.MAILTRAP_SMTP_PASS
        },
    });
    //now wrap it in an aysnc , so we can use await
    //so lets create an mail object and send this

    const mail = {
        from : "mail.taskmanager@example.com",
        to : options.email, //receiver's email
        subject : options.subject,
        text : emailTextual,
        html : emailHTML
    }
    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed silently. Make sure that you have provided your MAILTRAP credentials in the .env file")
        console.error("Error : ",error)
    }  
};

// for verification of email , we mail these content

const emailVerificationMailgenContent = (username,verificationUrl) =>{
    return {
        body : {
            name : username,
            intro : "welcome to our App ! we're excited to have you on board.",
            action:{
                instructions:"To verify your email please click on the following button",
                button:{
                    color : "#1aae5aff",
                    text: "verify your email",
                    link : verificationUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};
//for forgot password mail generation content

const forgotPasswordnMailgenContent = (username,passwordResetUrl) =>{
    return {
        body : {
            name : username,
            intro : "We got a request to reset teh password of your account.",
            action:{
                instructions: "To reset your password click on the following button or link.",

                button:{
                    color : "#2760d3ff",
                    text: "Reset password",
                    link : passwordResetUrl,
                },
            },
            outro: "Need help, or ahve questions? Just reply to this email, we'd love to help.",
        },
    };
};

export{
    emailVerificationMailgenContent,
    forgotPasswordnMailgenContent,
    sendEmail,
};


