import AppDataSource from '../../data-source';
import { Relationship } from '../../entities/relationship.entity';
import { AppError } from '../../errors/appErrors';
import { IAcceptFriendRequest, IAcceptFriendResponse } from '../../interface/friends/friend.interface';

const acceptFriendService = async ({
   requestId,
   userId
}: IAcceptFriendRequest): Promise<IAcceptFriendResponse> => {
   const relationshipRepository = AppDataSource.getRepository(Relationship);

   const relation = await relationshipRepository.findOne({
      where: {
         id: requestId,
         addressee: {
            id: userId
         }
      },
      relations: [ 'requester', 'addressee' ]
   });

   if (!relation) {
      throw new AppError(404, 'Relation request not exist');
   }

   relation.type = 'accepted';

   await relationshipRepository.save(relation);

   const addresseeRelationship = new Relationship();
   addresseeRelationship.requester = relation.addressee;
   addresseeRelationship.addressee = relation.requester;
   addresseeRelationship.type = 'accepted';

   await relationshipRepository.save(addresseeRelationship);

   return { message: 'Convite de amizade confirmado' };
};

export default acceptFriendService;
