const admin = require("firebase-admin");
const { response } = require("../utils/response");

const db = admin.firestore();

const addCity = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return response.unauthorized(res, "Unauthorized");

    const { name } = req.body;
    if (!name || !name.trim())
      return response.badRequest(res, "City name is required");

    const cityName = name.trim();

    // check duplicate for this user
    const dupQuery = db
      .collection("cities")
      .where("userId", "==", uid)
      .where("name", "==", cityName)
      .limit(1);

    const dupSnap = await dupQuery.get();
    if (!dupSnap.empty) {
      return response.conflict(res, "City is already in your saved list");
    }

    // check if this is first city for user
    const userCitiesQuery = db
      .collection("cities")
      .where("userId", "==", uid)
      .limit(1);

    const userCitiesSnap = await userCitiesQuery.get();
    const isFirstCity = userCitiesSnap.empty;

    // add doc
    const docRef = await db.collection("cities").add({
      name: cityName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: uid,
      isDefault: isFirstCity || false,
    });

    // fetch newly created doc to return (with timestamp converted)
    const newDocSnap = await docRef.get();
    const newData = newDocSnap.data();
    // convert timestamp to millis if exists
    if (newData.createdAt && newData.createdAt.toMillis) {
      newData.createdAt = newData.createdAt.toMillis();
    }

    return response.ok(res, "City added", { id: docRef.id, ...newData });
  } catch (err) {
    console.error("Add city error:", err);
    return response.serverError(res, "Failed to add city", err.message);
  }
};

const getCities = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return response.unauthorized(res, "Unauthorized");

    const q = db
      .collection("cities")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc");

    const snap = await q.get();
    const cities = snap.docs.map((d) => {
      const data = d.data();
      if (data.createdAt && data.createdAt.toMillis)
        data.createdAt = data.createdAt.toMillis();
      return { id: d.id, ...data };
    });

    return response.ok(res, "Cities fetched", cities);
  } catch (err) {
    console.error("Get cities error:", err);
    return response.serverError(res, "Failed to fetch cities", err.message);
  }
};
// ✅ Remove city
const removeCity = async (req, res) => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;
    if (!uid) return response.unauthorized(res, "Unauthorized");

    const docRef = db.collection("cities").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists || docSnap.data().userId !== uid) {
      return response.notFound(res, "City not found or not authorized");
    }

    await docRef.delete();
    return response.ok(res, "City removed", { id });
  } catch (err) {
    console.error("Remove city error:", err);
    return response.serverError(res, "Failed to remove city", err.message);
  }
};

// ✅ Set default city
const setDefaultCity = async (req, res) => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params;
    if (!uid) return response.unauthorized(res, "Unauthorized");

    const cityRef = db.collection("cities").doc(id);
    const citySnap = await cityRef.get();

    if (!citySnap.exists || citySnap.data().userId !== uid) {
      return response.notFound(res, "City not found or not authorized");
    }

    // Unset all user's default cities
    const batch = db.batch();
    const userCities = await db
      .collection("cities")
      .where("userId", "==", uid)
      .get();

    userCities.forEach((doc) => {
      batch.update(doc.ref, { isDefault: doc.id === id });
    });

    await batch.commit();

    return response.ok(res, "Default city set", { id });
  } catch (err) {
    console.error("Set default city error:", err);
    return response.serverError(res, "Failed to set default city", err.message);
  }
};

module.exports = { addCity, getCities, removeCity, setDefaultCity };
