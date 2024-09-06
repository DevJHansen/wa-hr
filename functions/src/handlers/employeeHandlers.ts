import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import { https } from 'firebase-functions/v1';
import {
  BAD_REQUEST,
  CONFLICT,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  SUCCESS,
  UNAUTHORIZED,
} from '../constants/statusCodes';
import { getUser, getUserDoc } from '../utils/authUtils';
import type { Response } from 'firebase-functions';
import { z } from 'zod';
import * as functions from 'firebase-functions';
import {
  EMPLOYEES_COLLECTION,
  USERS_COLLECTION,
} from '../constants/firestoreConstants';
import { UserSchema } from '../schemas/userSchema';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import { employeeArraySchema, EmployeeSchema } from '../schemas/employeeSchema';
import { getTotalPages } from '../utils/pagination';
import { v4 as uuidv4 } from 'uuid';

export const handleRemoveEmployeeTeam = async (
  request: https.Request,
  response: Response,
  db: Firestore
) => {
  const user = await getUser(request);

  if (!user) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const userRecord = await admin.auth().getUser(user.uid);

  if (userRecord.customClaims?.role !== 'admin') {
    return;
  }

  const userDocRef = await db.collection(USERS_COLLECTION).doc(user.uid).get();

  if (!userDocRef.exists) {
    throw new Error(`User with the id: ${user.uid} not found in firestore.`);
  }

  const { companyId } = userDocRef.data() as UserSchema;

  const reqBody = z.object({
    team: z.string(),
  });

  const validatedBody = reqBody.safeParse(request.body);

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { team } = validatedBody.data;

  const companyEmployeesRef = await db
    .collection(EMPLOYEES_COLLECTION)
    .where('companyId', '==', companyId)
    .where('team', '==', team)
    .get();

  if (companyEmployeesRef.empty) {
    response.sendStatus(SUCCESS);
    return;
  }

  const batch = db.batch();
  companyEmployeesRef.forEach((doc) => {
    const docRef = db.collection(EMPLOYEES_COLLECTION).doc(doc.id);
    batch.update(docRef, { team: '' });
  });

  await batch.commit();

  response.sendStatus(SUCCESS);
};

export const handleGetEmployees = async (
  request: https.Request,
  response: Response
) => {
  const submittingUser = await getUser(request);

  if (!submittingUser) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserRef = admin
    .firestore()
    .collection(USERS_COLLECTION)
    .doc(submittingUser?.uid ?? '')
    .get();

  if (!(await submittingUserRef).exists) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserDoc = (await submittingUserRef).data() as UserSchema;

  const page = parseInt(request.query.page as string) || 1;

  try {
    const collectionRef = admin.firestore().collection(EMPLOYEES_COLLECTION);

    const employees = await collectionRef
      .where('companyId', '==', submittingUserDoc.companyId)
      .orderBy('createdAt', 'desc')
      .limit(DEFAULT_PAGE_SIZE)
      .offset((page - 1) * DEFAULT_PAGE_SIZE)
      .get();

    const employeeDocs = employees.docs.map((doc) => doc.data());

    const validateFilter = employeeArraySchema.safeParse(employeeDocs);

    if (!validateFilter.success) {
      return response
        .status(BAD_REQUEST)
        .send({ message: 'Error getting employees' });
    }

    const orderedEmployees = validateFilter.data.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    const countSnapshot = await collectionRef.count().get();

    const totalPages = getTotalPages(
      countSnapshot.data().count,
      DEFAULT_PAGE_SIZE
    );

    return response.status(SUCCESS).send({
      employees: orderedEmployees,
      page,
      totalPages,
    });
  } catch (error) {
    functions.logger.error(error);
    return response
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Error getting employees' });
  }
};

export const handleCreateEmployee = async (
  request: https.Request,
  response: Response,
  db: Firestore
) => {
  const submittingUser = await getUser(request);

  if (!submittingUser) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserDoc = await getUserDoc(submittingUser?.uid ?? '');

  if (!submittingUserDoc) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const newEmployeeFields = z.object({
    team: z.string(),
    firstName: z.string(),
    surname: z.string(),
    idNumber: z.string(),
    number: z.string(),
  });

  const validatedBody = newEmployeeFields.safeParse(request.body);

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { team, idNumber, number, firstName, surname } = validatedBody.data;

  const isUnique = await db
    .collection(EMPLOYEES_COLLECTION)
    .where('number', '==', number)
    .get();

  if (!isUnique.empty) {
    response
      .status(CONFLICT)
      .send({ message: 'Employee with that number already exists' });
    return;
  }

  try {
    const uid = uuidv4();
    const employeeDocRef = db.collection(USERS_COLLECTION).doc(uid);

    const employeeData: EmployeeSchema = {
      firstName,
      surname,
      uid,
      createdAt: Date.now(),
      updatedAt: 0,
      companyId: submittingUserDoc.companyId,
      team,
      idNumber,
      number,
      verificationStatus: 'pending',
    };

    await employeeDocRef.set(employeeData);
    response.status(CREATED).send(employeeData);
  } catch (error) {
    functions.logger.error(error);
    response
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Error creating employee' });
  }
};

export const handleUpdateEmployee = async (
  request: https.Request,
  response: Response,
  db: Firestore
) => {
  const submittingUser = await getUser(request);

  if (!submittingUser) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserDoc = await getUserDoc(submittingUser?.uid ?? '');

  const updateEmployeeFields = z.object({
    team: z.string(),
    firstName: z.string(),
    surname: z.string(),
    idNumber: z.string(),
    number: z.string(),
    uid: z.string(),
  });

  const validatedBody = updateEmployeeFields.safeParse(request.body);

  if (!submittingUserDoc) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { team, number, firstName, surname, idNumber, uid } =
    validatedBody.data;

  const employeeToUpdate = await db
    .collection(EMPLOYEES_COLLECTION)
    .doc(uid)
    .get();

  if (!employeeToUpdate.exists) {
    response.status(NOT_FOUND).send({ message: 'Employee does not exist' });
    return;
  }

  const typedEmployeeToUpDate = employeeToUpdate.data() as EmployeeSchema;

  if (typedEmployeeToUpDate.companyId !== submittingUserDoc.companyId) {
    response.status(NOT_FOUND).send({ message: 'Employee does not exist' });
    return;
  }

  try {
    await db.collection(USERS_COLLECTION).doc(uid).update({
      firstName,
      surname,
      team,
      number,
      idNumber,
      updatedAt: Date.now(),
    });

    response.status(SUCCESS).send({ message: 'Employee updated successfully' });
  } catch (error) {
    functions.logger.error(error);
    response
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Error updating employee' });
  }
};

export const handleDeleteEmployee = async (
  request: https.Request,
  response: Response,
  db: Firestore
) => {
  const submittingUser = await getUser(request);

  if (!submittingUser) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const submittingUserDoc = await getUserDoc(submittingUser?.uid ?? '');

  if (!submittingUserDoc) {
    response.status(UNAUTHORIZED).send({ message: 'Unauthorized' });
    return;
  }

  const userUID = z.object({
    uid: z.string(),
  });

  const validatedBody = userUID.safeParse(request.body);

  if (!validatedBody.success) {
    functions.logger.error(validatedBody.error);
    response.status(BAD_REQUEST).send({ message: 'Missing required fields' });
    return;
  }

  const { uid } = validatedBody.data;

  const employeeToUpdate = await db
    .collection(EMPLOYEES_COLLECTION)
    .doc(uid)
    .get();

  if (!employeeToUpdate.exists) {
    response.status(NOT_FOUND).send({ message: 'Employee does not exist' });
    return;
  }

  const typedEmployeeToUpdate = employeeToUpdate.data() as EmployeeSchema;

  if (typedEmployeeToUpdate.companyId !== submittingUserDoc.companyId) {
    response.status(NOT_FOUND).send({ message: 'Employee does not exist' });
    return;
  }

  try {
    await db.collection(EMPLOYEES_COLLECTION).doc(uid).delete();
    response.status(SUCCESS).send({ message: 'Employee deleted successfully' });
  } catch (error) {
    functions.logger.error(error);
    response
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: 'Error deleting employee' });
  }
};
