export const validateReset = ({ otp, password, confirmPassword }) => {
  if (!otp) return "Code OTP requis";

  if (!/^\d{6}$/.test(otp))
    return "OTP invalide (6 chiffres requis)";

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password))
    return "Mot de passe trop faible";

  if (password !== confirmPassword)
    return "Les mots de passe ne correspondent pas";

  return null;
};