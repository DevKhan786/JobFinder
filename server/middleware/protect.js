const protect = async (req, res, next) => {
  try {
    if (req.oidc.isAuthenticated()) {
      next();
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  } catch (error) {
    console.log("Error in protect middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default protect;
