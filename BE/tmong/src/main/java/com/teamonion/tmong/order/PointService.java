package com.teamonion.tmong.order;

import com.teamonion.tmong.exception.GlobalException;
import com.teamonion.tmong.exception.OrdersExceptionType;
import com.teamonion.tmong.member.Member;
import com.teamonion.tmong.member.MemberService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PointService {

    @NonNull
    private final MemberService memberService;

    private static final double BONUS_RATE = 0.1;

    void pointProcess(Orders orders) {
        long buyerOwnPoint = memberService.getPoint(orders.getBuyer().getId());

        if (orders.getPaymentType().equals(PaymentType.POINT)) {
            buyerOwnPoint = payByPoint(orders.getBuyer(), buyerOwnPoint, orders.getAmount());
        }

        addBonusPoint(orders.getBuyer(), buyerOwnPoint, orders.getAmount());
    }

    private long payByPoint(Member buyer, long buyerOwnPoint, long amount) {
        long point = buyerOwnPoint - amount;

        if (point < 0) {
            throw new GlobalException(OrdersExceptionType.ORDER_POINT_LACK);
        }

        return memberService.pointUpdate(buyer.getId(), point);
    }

    private void addBonusPoint(Member buyer, long buyerOwnPoint, long amount) {
        long point = (long) (amount * BONUS_RATE) + buyerOwnPoint;

        memberService.pointUpdate(buyer.getId(), point);
    }

}
