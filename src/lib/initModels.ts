import Bounty from "@/model/Bounty";
import User from "@/model/User";


const initModels = () => {
  // This function ensures models are registered
  User.init();
  Bounty.init();
};

export default initModels;